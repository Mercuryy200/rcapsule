import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is premium
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

    let imageBlob: Blob;
    let fileName: string;

    if (imageUrl) {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image from URL");
      }

      const arrayBuffer = await response.arrayBuffer();

      // Determine content type from URL or response
      let contentType = response.headers.get("content-type") || "image/jpeg";

      // Handle cases where content-type might be wrong
      if (contentType.includes("mp4") || contentType.includes("video")) {
        // Try to determine from URL extension
        const urlLower = imageUrl.toLowerCase();
        if (urlLower.includes(".jpg") || urlLower.includes(".jpeg")) {
          contentType = "image/jpeg";
        } else if (urlLower.includes(".png")) {
          contentType = "image/png";
        } else if (urlLower.includes(".webp")) {
          contentType = "image/webp";
        } else {
          contentType = "image/jpeg"; // Default to jpeg
        }
      }

      imageBlob = new Blob([arrayBuffer], { type: contentType });
      fileName = `image.${contentType.split("/")[1] || "jpg"}`;
    } else if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

      if (!validTypes.includes(file.type)) {
        // Try to determine from file name
        const nameLower = file.name.toLowerCase();
        let contentType = "image/jpeg";

        if (nameLower.endsWith(".png")) {
          contentType = "image/png";
        } else if (nameLower.endsWith(".webp")) {
          contentType = "image/webp";
        } else if (nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg")) {
          contentType = "image/jpeg";
        }

        const arrayBuffer = await file.arrayBuffer();
        imageBlob = new Blob([arrayBuffer], { type: contentType });
        fileName = file.name;
      } else {
        imageBlob = file;
        fileName = file.name;
      }
    } else {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 },
      );
    }

    // Send to Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageBlob, fileName);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY!,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Remove.bg error:", error);
      throw new Error(error.errors?.[0]?.title || "Background removal failed");
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
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
