//app/api/wardrobes/[id]/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: wardrobeRaw, error } = await supabase
      .from("Wardrobe")
      .select(
        `
        *,
        WardrobeClothes (
          addedAt,
          notes,
          clothes:Clothes (*)
        )
      `,
      )
      .eq("id", id)
      .eq("userId", session.user.id)
      .single();

    if (error || !wardrobeRaw) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 },
      );
    }

    // 1. Process Clothes List
    const clothes = (wardrobeRaw.WardrobeClothes || [])
      .map((wc: any) => {
        if (!wc.clothes) return null;
        return {
          ...wc.clothes,
          addedToWardrobeAt: wc.addedAt,
          wardrobeNotes: wc.notes,
        };
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) =>
          new Date(b.addedToWardrobeAt).getTime() -
          new Date(a.addedToWardrobeAt).getTime(),
      );

    // 2. Calculate Stats (Total Cost & Color Analysis)
    let totalValue = 0;
    const colorCounts: Record<string, number> = {};
    let totalColorTags = 0;

    clothes.forEach((item: any) => {
      // Sum Price
      if (item.price) {
        totalValue += item.price;
      }

      // Count Colors
      if (Array.isArray(item.colors)) {
        item.colors.forEach((color: string) => {
          const normalizedColor = color.toLowerCase().trim();
          colorCounts[normalizedColor] =
            (colorCounts[normalizedColor] || 0) + 1;
          totalColorTags++;
        });
      }
    });

    // Format Color Data for Charting/Display
    const colorAnalysis = Object.entries(colorCounts)
      .map(([color, count]) => ({
        color,
        count,
        percentage:
          totalColorTags > 0 ? Math.round((count / totalColorTags) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by most frequent

    const wardrobe = {
      ...wardrobeRaw,
      clothes: clothes,
      stats: {
        totalValue: parseFloat(totalValue.toFixed(2)),
        itemCount: clothes.length,
        colorAnalysis,
      },
    };

    delete wardrobe.WardrobeClothes;

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error fetching wardrobe:", error);
    return NextResponse.json(
      { error: "Failed to fetch wardrobe" },
      { status: 500 },
    );
  }
}

// ... PUT and DELETE handlers remain unchanged ...
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const supabase = getSupabaseServer();
    const updatePayload: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.isPublic !== undefined) updatePayload.isPublic = data.isPublic;
    if (data.coverImage !== undefined)
      updatePayload.coverImage = data.coverImage;

    const { data: wardrobe, error } = await supabase
      .from("Wardrobe")
      .update(updatePayload)
      .eq("id", id)
      .eq("userId", session.user.id)
      .select()
      .single();

    if (error || !wardrobe) {
      return NextResponse.json(
        { error: "Wardrobe not found or update failed" },
        { status: 404 },
      );
    }

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error updating wardrobe:", error);
    return NextResponse.json(
      { error: "Failed to update wardrobe" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: existing, error: fetchError } = await supabase
      .from("Wardrobe")
      .select("id, userId")
      .eq("id", id)
      .single();

    if (fetchError || !existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 },
      );
    }
    await supabase.from("WardrobeClothes").delete().eq("wardrobeId", id);
    await supabase.from("WardrobeOutfit").delete().eq("wardrobeId", id);

    const { error: deleteError } = await supabase
      .from("Wardrobe")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wardrobe:", error);
    return NextResponse.json(
      { error: "Failed to delete wardrobe" },
      { status: 500 },
    );
  }
}
