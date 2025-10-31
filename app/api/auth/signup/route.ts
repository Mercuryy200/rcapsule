import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const { email, password, name } = await req.json();

    console.log("=== SIGNUP DEBUG ===");
    console.log("Signup attempt:", { email, name });
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Has Service Key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || null },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    console.log("Auth response:", {
      success: !authError,
      userId: authData?.user?.id,
      error: authError?.message,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    console.log("User created in auth.users:", authData.user.id);

    // Wait a moment for the trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user record was created in User table
    const { data: userRecord, error: dbError } = await supabase
      .from("User")
      .select("id, email, name")
      .eq("id", authData.user.id)
      .single();

    console.log("User table check:", {
      found: !!userRecord,
      error: dbError?.message,
    });

    if (dbError) {
      console.error("Database record check error:", dbError);
      // If trigger didn't work, create manually
      console.log("Attempting manual user creation...");
      const { error: insertError } = await supabase.from("User").insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: name || null,
        emailVerified: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Manual insert error:", insertError);
      } else {
        console.log("User manually created in User table");
      }
    } else {
      console.log("User record found:", userRecord);
    }

    console.log("===================");

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
