import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

//Category Detection
const detectCategory = (text: string): string => {
  const t = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    // Footwear
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
    Shoes: ["shoe", "loafer", "mule", "flat", "derby", "oxford"], // Catch-all for other shoes

    // Bottoms (Broken Down)
    Skirts: ["skirt", "mini", "midi", "maxi"],
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

    // One-Piece
    Dresses: ["dress", "gown", "sundress", "kaftan"],
    Jumpsuits: ["jumpsuit", "romper", "overall", "bodysuit"],

    // Outerwear (Broken Down)
    Jackets: ["jacket", "windbreaker", "bomber", "shacket", "blazer", "vest"],
    Coats: ["coat", "parka", "trench", "puffer", "overcoat"],

    // Tops (Broken Down)
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

    // Accessories
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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, brand, price, imageUrl, link, description, size } = body;

    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const supabase = getSupabaseServer();

    const textToAnalyze = `${name} ${description || ""} ${brand || ""}`;
    const detectedCategory = detectCategory(textToAnalyze);

    const { data: clothingItem, error } = await supabase
      .from("Clothes")
      .insert({
        userId: session.user.id,
        name,
        brand: brand || null,
        price: price ? parseFloat(price) : null,
        imageUrl: imageUrl || null,
        link: link || null,
        category: detectedCategory,
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
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Imported as ${detectedCategory}`,
      data: clothingItem,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Server Exception", details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
