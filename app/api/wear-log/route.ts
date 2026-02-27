import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";
import { getErrorMessage } from "@/lib/utils/error";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { items, date } = body;

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  try {
    // Prepare the logs
    const logs = items.map((itemId: string) => ({
      userId: session.user?.id,
      clothesId: itemId,
      wornAt: date || new Date().toISOString(),
    }));

    // Insert into WearLog table
    const { error } = await supabase.from("WearLog").insert(logs);

    if (error) throw error;

    // Optional: If you want to update the OutfitRecommendation status to "worn"
    // You would need to pass the recommendationId from the frontend to do this.

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
