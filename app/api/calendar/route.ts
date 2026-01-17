import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

async function updateOutfitStats(
  supabase: any,
  outfitId: string,
  metadata?: any,
) {
  const { count, error: countError } = await supabase
    .from("WearLog")
    .select("*", { count: "exact", head: true })
    .eq("outfitId", outfitId);

  if (countError) console.error("Error counting wears:", countError);

  const { data: latestLog } = await supabase
    .from("WearLog")
    .select("wornAt")
    .eq("outfitId", outfitId)
    .order("wornAt", { ascending: false })
    .limit(1)
    .single();

  const updates: any = {
    timesWorn: count || 0,
    lastWornAt: latestLog?.wornAt || null,
  };

  if (metadata) {
    if (metadata.weather) updates.weatherWorn = metadata.weather;
    if (metadata.temperature)
      updates.temperatureWorn = parseInt(metadata.temperature);
    if (metadata.location) updates.locationWorn = metadata.location;
  }

  await supabase.from("Outfit").update(updates).eq("id", outfitId);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const supabase = getSupabaseServer();

  let query = supabase
    .from("WearLog")
    .select(
      `
      id, wornAt, occasion, weather, temperature, notes, outfitId, clothesId,
      outfit:Outfit(id, name, imageUrl),
      clothes:Clothes(id, name, imageUrl, category)
    `,
    )
    .eq("userId", session.user.id)
    .order("wornAt", { ascending: true });

  if (start && end) {
    query = query
      .gte("wornAt", `${start}T00:00:00`)
      .lte("wornAt", `${end}T23:59:59`);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, outfitId, occasion, weather, temperature, location, notes } =
    body;
  const timestamp = `${date}T12:00:00`;

  const supabase = getSupabaseServer();

  try {
    const { data: outfitItems } = await supabase
      .from("OutfitClothes")
      .select("clothesId")
      .eq("outfitId", outfitId);

    if (!outfitItems || outfitItems.length === 0) {
      return NextResponse.json({ error: "Outfit empty" }, { status: 400 });
    }

    const logs = outfitItems.map((item) => ({
      userId: session.user?.id,
      clothesId: item.clothesId,
      outfitId,
      wornAt: timestamp,
      occasion,
      weather,
      temperature: temperature ? parseInt(temperature) : null,
      location,
      notes,
    }));

    const { error } = await supabase.from("WearLog").insert(logs);
    if (error) throw error;

    await updateOutfitStats(supabase, outfitId, {
      weather,
      temperature,
      location,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    originalDate,
    outfitId,
    newDate,
    occasion,
    weather,
    temperature,
    location,
    notes,
  } = body;
  const oldTimestamp = `${originalDate}T12:00:00`;
  const newTimestamp = `${newDate}T12:00:00`;

  const supabase = getSupabaseServer();

  try {
    const { error } = await supabase
      .from("WearLog")
      .update({
        wornAt: newTimestamp,
        occasion,
        weather,
        temperature: temperature ? parseInt(temperature) : null,
        location,
        notes,
      })
      .eq("outfitId", outfitId)
      .eq("wornAt", oldTimestamp);

    if (error) throw error;

    await updateOutfitStats(supabase, outfitId, {
      weather,
      temperature,
      location,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const outfitId = searchParams.get("outfitId");
  const date = searchParams.get("date");

  if (!outfitId || !date)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const supabase = getSupabaseServer();
  const timestamp = `${date}T12:00:00`;

  try {
    const { error } = await supabase
      .from("WearLog")
      .delete()
      .eq("outfitId", outfitId)
      .eq("wornAt", timestamp);

    if (error) throw error;

    await updateOutfitStats(supabase, outfitId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
