// app/api/wardrobes/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: wardrobes, error } = await supabase
      .from("Wardrobe")
      .select(
        `
        *,
        WardrobeClothes(count)
      `,
      )
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    const wardrobesWithCount = (wardrobes || []).map((wardrobe: any) => ({
      id: wardrobe.id,
      title: wardrobe.title,
      description: wardrobe.description,
      isPublic: wardrobe.isPublic,
      coverImage: wardrobe.coverImage,
      clothesCount: wardrobe.WardrobeClothes?.[0]?.count || 0,
      createdAt: wardrobe.createdAt,
      updatedAt: wardrobe.updatedAt,
    }));

    return NextResponse.json(wardrobesWithCount);
  } catch (error) {
    console.error("Error fetching wardrobes:", error);
    return NextResponse.json(
      { error: "Failed to fetch wardrobes" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data: wardrobe, error } = await supabase
      .from("Wardrobe")
      .insert({
        userId: session.user.id,
        title: data.title,
        description: data.description || null,
        isPublic: data.isPublic || false,
        coverImage: data.coverImage || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(wardrobe, { status: 201 });
  } catch (error) {
    console.error("Error creating wardrobe:", error);
    return NextResponse.json(
      { error: "Failed to create wardrobe" },
      { status: 500 },
    );
  }
}
