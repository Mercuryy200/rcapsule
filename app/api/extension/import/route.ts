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
  return new NextResponse(null, { status: 200, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders(origin) },
      );
    }

    const body = await req.json();
    const {
      name,
      brand,
      price,
      imageUrl,
      link,
      size,
      category,
      status,
      materials,
      description,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const supabase = getSupabaseServer();
    const finalCategory = category || "Uncategorized";
    const finalStatus = status || "owned";
    const finalDate =
      finalStatus === "wishlist"
        ? null
        : new Date().toISOString().split("T")[0];

    // 1. Upsert into GlobalProduct catalog
    let globalProductId: string | null = null;

    if (link) {
      const { data: existingProduct } = await supabase
        .from("GlobalProduct")
        .select("id")
        .eq("retaillink", link)
        .single();

      if (existingProduct) {
        globalProductId = existingProduct.id;
      } else {
        const { data: newProduct, error: gpError } = await supabase
          .from("GlobalProduct")
          .insert({
            name,
            brand: brand || "Unknown",
            category: finalCategory,
            description: description || null,
            retaillink: link,
            imageurl: imageUrl || null,
            colors: [],
            materials: materials || null,
            originalprice: price ? parseFloat(price) : null,
            source: new URL(link).hostname.replace("www.", ""),
          })
          .select("id")
          .single();

        if (gpError) {
          console.error("GlobalProduct insert error:", gpError);
          // Non-blocking — still save the clothing item
        } else {
          globalProductId = newProduct.id;
        }
      }
    }

    // 2. Insert into user's Clothes
    const { error } = await supabase
      .from("Clothes")
      .insert({
        userId: session.user.id,
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
        materials: materials || null,
        description: description || null,
        globalproductid: globalProductId,
      })
      .select()
      .single();

    if (error) {
      console.error("Clothes insert error:", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json(
      { success: true, message: "Imported successfully", globalProductId },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Server Exception", details: String(error) },
      { status: 500, headers: corsHeaders(req.headers.get("origin") || "") },
    );
  }
}
