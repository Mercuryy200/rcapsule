import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: clothing, error } = await supabase
      .from("Clothes")
      .select(`
        *,
        wardrobes:WardrobeClothes(
          wardrobeId,
          addedAt,
          notes,
          wardrobe:Wardrobe(
            id,
            title,
            description,
            isPublic,
            coverImage
          )
        )
      `)
      .eq("id", id)
      .eq("userId", session.user.id)
      .single();

    if (error || !clothing) {
      return NextResponse.json(
        { error: "Clothing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(clothing);
  } catch (error) {
    console.error("Error fetching clothing:", error);

    return NextResponse.json(
      { error: "Failed to fetch clothing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const supabase = getSupabaseServer();

    const { data: updatedClothing, error } = await supabase
      .from("Clothes")
      .update({
        name: data.name,
        category: data.category,
        brand: data.brand || null,
        price: data.price ? parseFloat(data.price) : null,
        purchaseDate: data.purchaseDate || null, // NEW FIELD
        colors: data.colors || [],
        season: data.season || null,
        size: data.size || null,
        link: data.link || null,
        imageUrl: data.imageUrl || null,
        placesToWear: data.placesToWear || [],
      })
      .eq("id", id)
      .eq("userId", session.user.id)
      .select();

    if (error || !updatedClothing || updatedClothing.length === 0) {
      return NextResponse.json(
        { error: "Clothing not found or unauthorized" },
        { status: 404 }
      );
    }

    if (data.wardrobeIds !== undefined) {
      await supabase
        .from("WardrobeClothes")
        .delete()
        .eq("clothesId", id);

      if (data.wardrobeIds && data.wardrobeIds.length > 0) {
        const wardrobeEntries = data.wardrobeIds.map((wardrobeId: string) => ({
          wardrobeId,
          clothesId: id,
        }));

        await supabase.from("WardrobeClothes").insert(wardrobeEntries);
      }
    }

    const { data: clothingWithWardrobes } = await supabase
      .from("Clothes")
      .select(`
        *,
        wardrobes:WardrobeClothes(
          wardrobeId,
          addedAt,
          wardrobe:Wardrobe(id, title)
        )
      `)
      .eq("id", id)
      .single();

    return NextResponse.json(clothingWithWardrobes || updatedClothing[0]);
  } catch (error) {
    console.error("Error updating clothing:", error);

    return NextResponse.json(
      { error: "Failed to update clothing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: deletedClothing, error } = await supabase
      .from("Clothes")
      .delete()
      .eq("id", id)
      .eq("userId", session.user.id)
      .select();

    if (error || !deletedClothing || deletedClothing.length === 0) {
      return NextResponse.json(
        { error: "Clothing not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting clothing:", error);

    return NextResponse.json(
      { error: "Failed to delete clothing" },
      { status: 500 }
    );
  }
}