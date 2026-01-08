import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.currentPassword || !data.newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: data.currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    await supabase
      .from("User")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
