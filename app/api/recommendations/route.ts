import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";
import { getWeather } from "@/lib/services/weather";
import {
  getOutfitRecommendation,
  getOutfitOptions,
} from "@/lib/services/ai-recommendations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const occasion = searchParams.get("occasion") || undefined;
  const count = parseInt(searchParams.get("count") || "1");

  const supabase = getSupabaseServer();

  try {
    // 1. Get user's location preferences
    const { data: prefs, error: prefsError } = await supabase
      .from("UserPreferences")
      .select("location_lat, location_lon, temperature_unit, styleGoals")
      .eq("userId", session.user.id)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      throw new Error(prefsError.message);
    }

    if (!prefs?.location_lat || !prefs?.location_lon) {
      return NextResponse.json(
        {
          error: "Location not set",
          code: "LOCATION_NOT_SET",
          message:
            "Please set your location in settings to get AI recommendations",
        },
        { status: 400 },
      );
    }

    // 2. Get weather data
    const weather = await getWeather(
      prefs.location_lat,
      prefs.location_lon,
      prefs.temperature_unit || "celsius",
    );

    // 3. Get user's clothes
    const { data: clothes, error: clothesError } = await supabase
      .from("Clothes")
      .select(
        "id, name, category, colors, season, placesToWear, style, materials, imageUrl, status",
      )
      .eq("userId", session.user.id)
      .eq("status", "owned");

    if (clothesError) {
      throw new Error(clothesError.message);
    }

    if (!clothes || clothes.length < 2) {
      return NextResponse.json(
        {
          error: "Not enough clothes",
          code: "INSUFFICIENT_WARDROBE",
          message: "Add at least 2 clothing items to get recommendations",
        },
        { status: 400 },
      );
    }

    // 4. Get recently worn items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentWearLogs } = await supabase
      .from("WearLog")
      .select("clothesId")
      .eq("userId", session.user.id)
      .gte("wornAt", sevenDaysAgo.toISOString());

    const recentlyWornIds = [
      ...new Set(recentWearLogs?.map((log) => log.clothesId) || []),
    ];

    // 5. Build context
    const context = {
      weather,
      occasion,
      userPreferences: {
        styleGoals: prefs.styleGoals || [],
      },
      recentlyWorn: recentlyWornIds,
    };

    // 6. Get AI recommendation(s)
    let recommendations;

    if (count > 1) {
      recommendations = await getOutfitOptions(
        clothes,
        context,
        Math.min(count, 5),
      );
    } else {
      const single = await getOutfitRecommendation(clothes, context);
      recommendations = [single];
    }

    return NextResponse.json({
      recommendations,
      weather: {
        temperature: weather.current.temperature,
        condition: weather.current.condition,
        description: weather.current.description,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendation",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Generate recommendation with custom parameters
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { occasion, excludeIds, customWeather } = body;

  const supabase = getSupabaseServer();

  try {
    // Get user preferences
    const { data: prefs } = await supabase
      .from("UserPreferences")
      .select("location_lat, location_lon, temperature_unit, styleGoals")
      .eq("userId", session.user.id)
      .single();

    // Get weather (use custom if provided, otherwise fetch)
    let weather;
    if (customWeather) {
      // Allow overriding weather for "what if" scenarios
      weather = customWeather;
    } else if (prefs?.location_lat && prefs?.location_lon) {
      weather = await getWeather(
        prefs.location_lat,
        prefs.location_lon,
        prefs.temperature_unit || "celsius",
      );
    } else {
      return NextResponse.json(
        {
          error: "Location not set",
          code: "LOCATION_NOT_SET",
        },
        { status: 400 },
      );
    }

    // Get clothes
    const { data: clothes } = await supabase
      .from("Clothes")
      .select(
        "id, name, category, colors, season, placesToWear, style, materials, imageUrl, status",
      )
      .eq("userId", session.user.id)
      .eq("status", "owned");

    if (!clothes || clothes.length < 2) {
      return NextResponse.json(
        {
          error: "Not enough clothes",
          code: "INSUFFICIENT_WARDROBE",
        },
        { status: 400 },
      );
    }

    // Get recently worn
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentWearLogs } = await supabase
      .from("WearLog")
      .select("clothesId")
      .eq("userId", session.user.id)
      .gte("wornAt", sevenDaysAgo.toISOString());

    const recentlyWornIds = [
      ...new Set(recentWearLogs?.map((log) => log.clothesId) || []),
      ...(excludeIds || []),
    ];

    const context = {
      weather,
      occasion,
      userPreferences: {
        styleGoals: prefs?.styleGoals || [],
      },
      recentlyWorn: recentlyWornIds,
    };

    const recommendation = await getOutfitRecommendation(clothes, context);

    return NextResponse.json({
      recommendation,
      weather: {
        temperature: weather.current.temperature,
        condition: weather.current.condition,
        description: weather.current.description,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendation",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
