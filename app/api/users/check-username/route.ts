import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { available: false, error: "Username must be 3-30 characters" },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        {
          available: false,
          error:
            "Username can only contain letters, numbers, dashes, and underscores",
        },
        { status: 400 },
      );
    }

    if (/^[-_]|[-_]$/.test(username)) {
      return NextResponse.json(
        {
          available: false,
          error: "Username cannot start or end with a dash or underscore",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("User")
      .select("id")
      .ilike("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking username:", error);
      return NextResponse.json(
        { error: "Failed to check username" },
        { status: 500 },
      );
    }

    const available = !data;

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
