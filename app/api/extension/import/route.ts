import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

// --- 1. CATEGORY DETECTION ---
const detectCategory = (text: string): string => {
  const t = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    Sneakers: [
      "sneaker",
      "trainer",
      "runner",
      "samba",
      "gazelle",
      "jordan",
      "yeezy",
      "dunk",
      "air force",
    ],
    Boots: ["boot", "chelsea", "doc marten", "timberland", "uggs"],
    Heels: ["heel", "pump", "stiletto", "wedge", "platform"],
    Sandals: ["sandal", "slide", "flip flop", "birkenstock", "croc"],
    Shoes: ["shoe", "loafer", "mule", "flat", "derby", "oxford"],
    Skirts: ["skirt", "miniskirt", "midiskirt", "maxiskirt"],
    Jeans: ["jean", "denim"],
    Shorts: ["short", "trunk", "boardshort"],
    Pants: [
      "pant",
      "trouser",
      "legging",
      "sweatpant",
      "jogger",
      "cargo",
      "chino",
      "slack",
      "trousers",
    ],
    Dresses: ["dress", "gown", "sundress", "kaftan"],
    Jumpsuits: ["jumpsuit", "romper", "overall", "bodysuit"],
    Jackets: ["jacket", "windbreaker", "bomber", "shacket", "blazer", "vest"],
    Coats: ["coat", "parka", "trench", "puffer", "overcoat"],
    Hoodies: ["hoodie", "sweatshirt"],
    Sweaters: [
      "sweater",
      "knit",
      "cardigan",
      "crewneck",
      "turtleneck",
      "pullover",
    ],
    Shirts: ["shirt", "blouse", "button up", "button-down", "flannel", "polo"],
    Tops: ["tee", "t-shirt", "top", "tank", "cami", "crop"],
    Bags: ["bag", "purse", "handbag", "tote", "clutch", "backpack", "wallet"],
    Hats: ["hat", "cap", "beanie", "fedora", "bucket"],
    Accessories: [
      "belt",
      "scarf",
      "glove",
      "sunglass",
      "jewelry",
      "sock",
      "tie",
      "watch",
      "necklace",
      "earring",
    ],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((word) => t.includes(word))) {
      return category;
    }
  }
  return "Uncategorized";
};

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// --- 3. OPTIONS HANDLER ---
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

// --- 4. POST HANDLER ---
export async function POST(req: Request) {
  // MOVED TO TOP: Extract origin before ANY other operations
  const origin = req.headers.get("origin") || "";

  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("[API] No session found.");
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in first" },
        { status: 401, headers: corsHeaders(origin) },
      );
    }

    const body = await req.json();
    const { name, brand, price, imageUrl, link, size, description, category } =
      body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const supabase = getSupabaseServer();

    // Logic: Use user selection -> OR auto-detect
    let finalCategory = category;
    if (!finalCategory || finalCategory === "Uncategorized") {
      const textToAnalyze = `${name} ${description || ""} ${brand || ""}`;
      finalCategory = detectCategory(textToAnalyze);
    }

    const { data: clothingItem, error } = await supabase
      .from("Clothes")
      .insert({
        userId: session.user.id,
        name,
        brand: brand || null,
        price: price ? parseFloat(price) : null,
        imageUrl: imageUrl || null,
        link: link || null,
        category: finalCategory,
        colors: [],
        season: null,
        size: size || null,
        placesToWear: [],
        purchaseDate: new Date().toISOString().split("T")[0],
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

    // Success Response
    return NextResponse.json(
      { success: true, message: "Imported successfully" },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Server Exception", details: String(error) },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
