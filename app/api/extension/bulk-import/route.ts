import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

// Browser extensions send a chrome-extension:// origin; allow the app origin too
const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ...(process.env.ALLOWED_EXTENSION_ORIGIN
    ? [process.env.ALLOWED_EXTENSION_ORIGIN]
    : []),
]);

function corsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, { status: 200, headers: corsHeaders(origin) });
}

const MAX_BATCH_SIZE = 50;

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
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty products array" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    if (products.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}` },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const supabase = getSupabaseServer();
    const results: Array<{
      url: string;
      success: boolean;
      error?: string;
      duplicate?: boolean;
    }> = [];

    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    for (const item of products) {
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
      } = item;

      if (!name) {
        results.push({ url: link || "", success: false, error: "Missing name" });
        errors++;
        continue;
      }

      try {
        const finalCategory = category || "Uncategorized";
        const finalStatus = status || "owned";
        const finalDate =
          finalStatus === "wishlist"
            ? null
            : new Date().toISOString().split("T")[0];

        // Check if user already has this item (deduplication by link)
        let globalProductId: string | null = null;

        if (link) {
          const { data: existingClothes } = await supabase
            .from("Clothes")
            .select("id")
            .eq("userId", session.user.id)
            .eq("link", link)
            .single();

          if (existingClothes) {
            results.push({ url: link, success: true, duplicate: true });
            duplicates++;
            continue;
          }

          // Upsert GlobalProduct
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

            if (!gpError && newProduct) {
              globalProductId = newProduct.id;
            }
          }
        }

        // Insert into Clothes
        const { error: clothesError } = await supabase
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
          });

        if (clothesError) {
          results.push({
            url: link || "",
            success: false,
            error: clothesError.message,
          });
          errors++;
        } else {
          results.push({ url: link || "", success: true });
          imported++;
        }
      } catch (itemError) {
        results.push({
          url: link || "",
          success: false,
          error: String(itemError),
        });
        errors++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        imported,
        duplicates,
        errors,
        total: products.length,
        results,
      },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    console.error("Bulk import error:", error);

    return NextResponse.json(
      { error: "Server Exception", details: String(error) },
      { status: 500, headers: corsHeaders(req.headers.get("origin") || "") },
    );
  }
}
