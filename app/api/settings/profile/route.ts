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
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.profilePublic !== undefined)
      updateData.profilePublic = data.profilePublic;

    const { data: user, error } = await supabase
      .from("User")
      .update(updateData)
      .eq("id", session.user.id)
      .select("name, image, profilePublic")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
