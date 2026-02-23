import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data: clothes, error } = await supabase
      .from("Clothes")
      .select("id, price, colors")
      .eq("userId", session.user.id);

    if (error) throw error;

    let totalValue = 0;
    const totalItems = clothes.length;

    const colorCounts: Record<string, number> = {};
    let totalColorTags = 0;

    clothes.forEach((item) => {
      if (item.price) totalValue += item.price;

      if (Array.isArray(item.colors)) {
        item.colors.forEach((c) => {
          const colorName = c.toLowerCase().trim();

          colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
          totalColorTags++;
        });
      }
    });

    const colorAnalysis = Object.entries(colorCounts)
      .map(([color, count]) => ({
        color,
        count,
        percentage:
          totalColorTags > 0 ? Math.round((count / totalColorTags) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalItems,
      colorAnalysis,
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
