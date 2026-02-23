import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("UserPreferences")
    .select("*")
    .eq("userId", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data || {
      userId: session.user.id,
      budgetGoal: null,
      sustainabilityGoals: null,
      styleGoals: [],
      notifications: {},
      analyticsPrivacy: "private",
      location_city: null,
      location_country: null,
      location_lat: null,
      location_lon: null,
      temperature_unit: "celsius",
    },
  );
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const allowedFields = [
    "budgetGoal",
    "sustainabilityGoals",
    "styleGoals",
    "notifications",
    "analyticsPrivacy",
    "location_city",
    "location_country",
    "location_lat",
    "location_lon",
    "temperature_unit",
  ];

  const updates: Record<string, any> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  updates.updatedAt = new Date().toISOString();

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("UserPreferences")
    .upsert(
      {
        userId: session.user.id,
        ...updates,
      },
      {
        onConflict: "userId",
      },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
