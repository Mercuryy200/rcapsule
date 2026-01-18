import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log("No session found in API call");
    }

    const body = await req.json();
    const { name, brand, price, imageUrl, link, size, category, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const supabase = getSupabaseServer();

    // Use category from extension, default to Uncategorized if empty
    const finalCategory = category || "Uncategorized";

    const finalStatus = status || "owned";
    const finalDate =
      finalStatus === "wishlist"
        ? null
        : new Date().toISOString().split("T")[0];

    const { data: clothingItem, error } = await supabase
      .from("Clothes")
      .insert({
        userId: session?.user?.id || "",
        name,
        brand: brand || null,
        price: price ? parseFloat(price) : null,
        imageUrl: imageUrl || null,
        link: link || null,
        category: finalCategory,
        size: size || null,
        status: finalStatus,
        purchaseDate: finalDate,
        colors: [],
        placesToWear: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Database Insert Error:", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json(
      { success: true, message: "Imported successfully" },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    console.error("Server Error:", error);
    const safeOrigin = req.headers.get("origin") || "";
    return NextResponse.json(
      { error: "Server Exception", details: String(error) },
      { status: 500, headers: corsHeaders(safeOrigin) },
    );
  }
}
