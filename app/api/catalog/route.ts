import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const filterType = searchParams.get("filter") || "all"; // all, product, brand, category
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const suggestions = searchParams.get("suggestions") === "true";

    const supabase = getSupabaseServer();

    // If requesting suggestions (top 10 by popularity)
    if (suggestions && query) {
      // Get products with their popularity count (number of users who have them)
      const { data: products, error } = await supabase
        .from("GlobalProduct")
        .select(`
          *,
          clothes:Clothes(count)
        `)
        .or(
          `name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`
        )
        .limit(50);

      if (error) throw error;

      // Sort by popularity (number of clothes entries referencing this product)
      const sortedProducts = (products || [])
        .map((p: any) => ({
          ...p,
          popularityCount: p.clothes?.[0]?.count || 0,
          clothes: undefined, // Remove the nested clothes data
        }))
        .sort((a: any, b: any) => b.popularityCount - a.popularityCount)
        .slice(0, 10);

      return NextResponse.json({
        products: sortedProducts,
        total: sortedProducts.length,
        type: "suggestions",
      });
    }

    // Regular search/browse
    let dbQuery = supabase
      .from("GlobalProduct")
      .select(`
        *,
        clothes:Clothes(count)
      `, { count: "exact" })
      .order("createdat", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search based on filter type
    if (query) {
      switch (filterType) {
        case "product":
          dbQuery = dbQuery.ilike("name", `%${query}%`);
          break;
        case "brand":
          dbQuery = dbQuery.ilike("brand", `%${query}%`);
          break;
        case "category":
          dbQuery = dbQuery.ilike("category", `%${query}%`);
          break;
        case "all":
        default:
          dbQuery = dbQuery.or(
            `name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`
          );
          break;
      }
    }

    const { data: products, error, count } = await dbQuery;

    if (error) throw error;

    // Add popularity count to each product
    const productsWithPopularity = (products || []).map((p: any) => ({
      ...p,
      popularityCount: p.clothes?.[0]?.count || 0,
      clothes: undefined,
    }));

    return NextResponse.json({
      products: productsWithPopularity,
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
