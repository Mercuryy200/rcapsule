import { NextRequest, NextResponse } from "next/server";
import { auth } from "@//auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // Option 1: Use remove.bg API (requires API key)
    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

    if (REMOVE_BG_API_KEY) {
      const formData = new FormData();
      formData.append("image_url", imageUrl);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Background removal failed");
      }

      const blob = await response.blob();

      // Convert blob to base64 for easy storage/display
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const processedImageUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({ processedImageUrl });
    }

    // Option 2: Client-side processing fallback
    // For now, return the original image with a note
    return NextResponse.json(
      {
        error:
          "Background removal service not configured. Please set REMOVE_BG_API_KEY environment variable.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Background removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove background" },
      { status: 500 },
    );
  }
}
