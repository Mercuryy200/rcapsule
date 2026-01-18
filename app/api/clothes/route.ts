import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const wardrobeId = searchParams.get("wardrobeId");
    const statusFilter = searchParams.get("status");
    const supabase = getSupabaseServer();

    if (wardrobeId) {
      const { data: wardrobeClothes, error } = await supabase
        .from("WardrobeClothes")
        .select(
          `
          addedAt,
          notes,
          clothes:Clothes(*)
        `,
        )
        .eq("wardrobeId", wardrobeId)
        .order("addedAt", { ascending: false });

      if (error) throw error;

      const clothes =
        wardrobeClothes?.map((wc: any) => ({
          ...wc.clothes,
          addedToWardrobeAt: wc.addedAt,
          wardrobeNotes: wc.notes,
        })) || [];

      return NextResponse.json(clothes);
    } else {
      // 2. FETCHING ALL CLOTHES (Main Closet / Wishlist)
      let query = supabase
        .from("Clothes")
        .select(
          `
          *,
          wardrobes:WardrobeClothes(
            wardrobeId,
            addedAt,
            wardrobe:Wardrobe(id, title)
          )
        `,
        )
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      // --- NEW FILTERING LOGIC ---
      if (statusFilter) {
        if (statusFilter === "owned") {
          // owned: Includes explicit 'owned' AND legacy items (null)
          query = query.or("status.eq.owned,status.is.null");
        } else {
          // wishlist: Strict equality
          query = query.eq("status", statusFilter);
        }
      }
      // ---------------------------

      const { data: clothes, error } = await query;

      if (error) throw error;

      return NextResponse.json(clothes || []);
    }
  } catch (error) {
    console.error("Error fetching clothes:", error);
    return NextResponse.json(
      { error: "Failed to fetch clothes" },
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

    const userId = session.user.id;
    const data = await req.json();

    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();

    // Validate Wardrobes if present
    if (data.wardrobeIds?.length > 0) {
      const { data: wardrobes, error } = await supabase
        .from("Wardrobe")
        .select("id, userId")
        .in("id", data.wardrobeIds);

      if (error || !wardrobes) {
        return NextResponse.json(
          { error: "Failed to validate wardrobes" },
          { status: 400 },
        );
      }

      const invalidWardrobes = wardrobes.filter(
        (w: any) => w.userId !== userId,
      );

      if (invalidWardrobes.length > 0) {
        return NextResponse.json(
          { error: "Invalid wardrobe access" },
          { status: 403 },
        );
      }
    }

    // Prepare Payload
    const clothingPayload = {
      userId: userId,
      name: data.name,
      brand: data.brand || null,
      category: data.category,
      price: data.price ? parseFloat(data.price) : null,

      // Handle Status & Date Logic
      status: data.status || "owned", // Default to owned
      purchaseDate:
        data.status === "wishlist" ? null : data.purchaseDate || null,

      colors: Array.isArray(data.colors) ? data.colors : [],
      season: data.season || null,
      size: data.size || null,
      link: data.link || null,
      imageUrl: data.imageUrl || null,
      placesToWear: Array.isArray(data.placesToWear) ? data.placesToWear : [],
    };

    const { data: clothing, error: createError } = await supabase
      .from("Clothes")
      .insert(clothingPayload)
      .select()
      .single();

    if (createError) throw createError;

    // Link to Wardrobes if IDs provided
    if (data.wardrobeIds?.length > 0) {
      const wardrobeEntries = data.wardrobeIds.map((wardrobeId: string) => ({
        wardrobeId,
        clothesId: clothing.id,
      }));

      const { error: junctionError } = await supabase
        .from("WardrobeClothes")
        .insert(wardrobeEntries);

      if (junctionError) {
        console.error("Error adding to wardrobes:", junctionError);
      }
    }

    const { data: clothingWithWardrobes } = await supabase
      .from("Clothes")
      .select(
        `
        *,
        wardrobes:WardrobeClothes(
          wardrobeId,
          addedAt,
          wardrobe:Wardrobe(id, title)
        )
      `,
      )
      .eq("id", clothing.id)
      .single();

    return NextResponse.json(clothingWithWardrobes || clothing, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating clothing:", error);
    return NextResponse.json(
      { error: "Failed to create clothing" },
      { status: 500 },
    );
  }
}
