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
      .select("*")
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
        brand: data.brand,
        price: data.price ? parseFloat(data.price) : null,
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

    return NextResponse.json({ message: "Updated successfully" });
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
