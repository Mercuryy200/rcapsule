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

    // Get wardrobe with clothes using a join
    const { data: wardrobe, error } = await supabase
      .from("Wardrobe")
      .select(
        `
        *,
        Clothes (
          *
        )
      `
      )
      .eq("id", id)
      .eq("userId", session.user.id)
      .single();

    if (error || !wardrobe) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    // Sort clothes by createdAt desc (Supabase doesn't support orderBy in nested selects)
    if (wardrobe.Clothes) {
      wardrobe.Clothes.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error fetching wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to fetch wardrobe" },
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

    // First, get the existing wardrobe
    const { data: existing, error: fetchError } = await supabase
      .from("wardrobe")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    // Update with fallbacks to existing values
    const { data: wardrobe, error: updateError } = await supabase
      .from("wardrobe")
      .update({
        title: data.title || existing.title,
        description:
          data.description !== undefined
            ? data.description
            : existing.description,
        isPublic:
          data.isPublic !== undefined ? data.isPublic : existing.isPublic,
        coverImage:
          data.coverImage !== undefined ? data.coverImage : existing.coverImage,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error updating wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to update wardrobe" },
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

    // Check if wardrobe exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from("wardrobe")
      .select("id, userId")
      .eq("id", id)
      .single();

    if (fetchError || !existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    // Delete the wardrobe
    const { error: deleteError } = await supabase
      .from("wardrobe")
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
      { status: 500 }
    );
  }
}
