import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = getSupabaseServer();

    let dbQuery = supabase
      .from("GlobalProduct")
      .select("*", { count: "exact" })
      .order("createdat", { ascending: false })
      .range(offset, offset + limit - 1);

    // Text search across name, brand, category
    if (query) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`
      );
    }

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    if (brand) {
      dbQuery = dbQuery.eq("brand", brand);
    }

    const { data: products, error, count } = await dbQuery;

    if (error) throw error;

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
