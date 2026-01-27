// app/api/remove-background/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: user } = await supabase
      .from("User")
      .select("subscription_status")
      .eq("id", session.user.id)
      .single();

    if (user?.subscription_status !== "premium") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    let base64Image: string;

    if (imageUrl) {
      console.log("Downloading image from URL:", imageUrl);

      // Download image from Vercel (bypasses all blocking)
      const imageResponse = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          Referer: new URL(imageUrl).origin,
        },
      });

      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`,
        );
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const contentType =
        imageResponse.headers.get("content-type") || "image/jpeg";

      base64Image = `data:${contentType};base64,${base64}`;
      console.log(
        `Image downloaded: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`,
      );
    } else if (file) {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = file.type || "image/jpeg";
      base64Image = `data:${mimeType};base64,${base64}`;
      console.log(
        `File converted: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`,
      );
    } else {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 },
      );
    }

    // Check if endpoint is configured
    if (!process.env.AWS_LAMBDA_ENDPOINT) {
      console.error("AWS_LAMBDA_ENDPOINT is not configured");
      return NextResponse.json(
        { error: "Background removal service is not configured" },
        { status: 500 },
      );
    }

    console.log("Calling Lambda endpoint:", process.env.AWS_LAMBDA_ENDPOINT);

    // Call AWS Lambda function with base64 image
    const lambdaResponse = await fetch(process.env.AWS_LAMBDA_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!lambdaResponse.ok) {
      const error = await lambdaResponse.json();
      console.error("Lambda error:", error);
      throw new Error(error.error || "Background removal failed");
    }

    const data = await lambdaResponse.json();

    return NextResponse.json({
      image: data.image,
      success: data.success,
    });
  } catch (error) {
    console.error("Remove background error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove background",
      },
      { status: 500 },
    );
  }
}
