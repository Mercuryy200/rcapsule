import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const supabase = getSupabaseServer();

    const { data: user, error } = await supabase
      .from("User")
      .update({
        name: data.name || null,
        image: data.image || null,
      })
      .eq("id", session.user.id)
      .select("name, image")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      name: user.name,
      image: user.image,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
