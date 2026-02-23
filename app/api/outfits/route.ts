import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: outfits, error } = await supabase
      .from("Outfit")
      .select(
        `
        *,
        OutfitClothes (
          id,
          layer,
          clothes:Clothes (*)
        )
      `,
      )
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data to include clothes array
    const transformedOutfits = (outfits || []).map((outfit) => ({
      ...outfit,
      clothes: (outfit.OutfitClothes || [])
        .map((oc: any) => oc.clothes)
        .filter(Boolean),
      itemCount: outfit.OutfitClothes?.length || 0,
    }));

    return NextResponse.json(transformedOutfits);
  } catch (error) {
    console.error("Error fetching outfits:", error);

    return NextResponse.json(
      { error: "Failed to fetch outfits" },
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
    const supabase = getSupabaseServer();

    // Create the outfit
    const { data: outfit, error: outfitError } = await supabase
      .from("Outfit")
      .insert({
        userId: session.user.id,
        name: data.name,
        description: data.description,
        season: data.season,
        occasion: data.occasion,
        imageUrl: data.imageUrl,
        isFavorite: data.isFavorite || false,
      })
      .select()
      .single();

    if (outfitError || !outfit) {
      throw outfitError;
    }

    // Add clothes to outfit
    if (data.clothesIds && data.clothesIds.length > 0) {
      const outfitClothes = data.clothesIds.map(
        (clothesId: string, index: number) => ({
          outfitId: outfit.id,
          clothesId,
          layer: index,
        }),
      );

      const { error: clothesError } = await supabase
        .from("OutfitClothes")
        .insert(outfitClothes);

      if (clothesError) {
        // Rollback outfit creation if adding clothes fails
        await supabase.from("Outfit").delete().eq("id", outfit.id);
        throw clothesError;
      }
    }

    // Add to wardrobes if specified
    if (data.wardrobeIds && data.wardrobeIds.length > 0) {
      const wardrobeOutfits = data.wardrobeIds.map((wardrobeId: string) => ({
        wardrobeId,
        outfitId: outfit.id,
      }));

      const { error: wardrobeError } = await supabase
        .from("WardrobeOutfit")
        .insert(wardrobeOutfits);

      if (wardrobeError) {
        console.error("Error adding outfit to wardrobes:", wardrobeError);
      }
    }

    return NextResponse.json(outfit, { status: 201 });
  } catch (error) {
    console.error("Error creating outfit:", error);

    return NextResponse.json(
      { error: "Failed to create outfit" },
      { status: 500 },
    );
  }
}
