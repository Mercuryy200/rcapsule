import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: user, error } = await supabase
      .from("User")
      .select(
        `
        id, 
        name, 
        email, 
        image, 
        profilePublic,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        subscription_period_end
      `,
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ...user,
      subscription_status: user.subscription_status || "free",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
