import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wardrobeId = searchParams.get("wardrobeId");
    const supabase = getSupabaseServer();

    // Build query
    let query = supabase
      .from("Clothes")
      .select("*")
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });

    // Conditionally add wardrobeId filter
    if (wardrobeId) {
      query = query.eq("wardrobeId", wardrobeId);
    }

    const { data: clothes, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(clothes || []);
  } catch (error) {
    console.error("Error fetching clothes:", error);

    return NextResponse.json(
      { error: "Failed to fetch clothes" },
      { status: 500 }
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

    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Verify wardrobe ownership if wardrobeId is provided
    if (data.wardrobeId) {
      const { data: wardrobe, error } = await supabase
        .from("Wardrobe")
        .select("id, userId")
        .eq("id", data.wardrobeId)
        .single();

      if (error || !wardrobe || wardrobe.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid wardrobe" },
          { status: 400 }
        );
      }
    }

    // Create clothing item
    const { data: clothing, error: createError } = await supabase
      .from("Clothes")
      .insert({
        userId: session.user.id,
        wardrobeId: data.wardrobeId || null,
        name: data.name,
        brand: data.brand,
        category: data.category,
        price: data.price ? parseFloat(data.price) : null,
        colors: data.colors || [],
        season: data.season || null,
        size: data.size || null,
        link: data.link || null,
        imageUrl: data.imageUrl || null,
        placesToWear: data.placesToWear || [],
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json(clothing, { status: 201 });
  } catch (error) {
    console.error("Error creating clothing:", error);

    return NextResponse.json(
      { error: "Failed to create clothing" },
      { status: 500 }
    );
  }
}
