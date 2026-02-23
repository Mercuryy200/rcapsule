import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

async function geocodeCity(
  city: string,
  country?: string,
): Promise<{
  lat: number;
  lon: number;
  city: string;
  country: string;
} | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const query = country ? `${city},${country}` : city;

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`,
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data || data.length === 0) return null;

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    city: data[0].name,
    country: data[0].country,
  };
}

// Reverse geocoding to get city from coordinates
async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{
  city: string;
  country: string;
} | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data || data.length === 0) return null;

  return {
    city: data[0].name,
    country: data[0].country,
  };
}

// GET - Fetch current location settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("UserPreferences")
    .select(
      "location_city, location_country, location_lat, location_lon, temperature_unit",
    )
    .eq("userId", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    city: data?.location_city || null,
    country: data?.location_country || null,
    lat: data?.location_lat || null,
    lon: data?.location_lon || null,
    temperatureUnit: data?.temperature_unit || "celsius",
    isSet: !!(data?.location_lat && data?.location_lon),
  });
}

// POST - Set location (by city name or coordinates)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { city, country, lat, lon, temperatureUnit } = body;

  let locationData: {
    location_city?: string;
    location_country?: string;
    location_lat?: number;
    location_lon?: number;
    temperature_unit?: string;
  } = {};

  // If coordinates provided, use them and reverse geocode for city name
  if (lat !== undefined && lon !== undefined) {
    const geoResult = await reverseGeocode(lat, lon);
    locationData = {
      location_lat: lat,
      location_lon: lon,
      location_city: geoResult?.city || "Unknown",
      location_country: geoResult?.country || "Unknown",
    };
  }
  // If city provided, geocode to get coordinates
  else if (city) {
    const geoResult = await geocodeCity(city, country);
    if (!geoResult) {
      return NextResponse.json(
        {
          error: "City not found",
          message:
            "Could not find the specified city. Please try a different city name.",
        },
        { status: 400 },
      );
    }
    locationData = {
      location_lat: geoResult.lat,
      location_lon: geoResult.lon,
      location_city: geoResult.city,
      location_country: geoResult.country,
    };
  }

  // Add temperature unit if provided
  if (temperatureUnit && ["celsius", "fahrenheit"].includes(temperatureUnit)) {
    locationData.temperature_unit = temperatureUnit;
  }

  if (Object.keys(locationData).length === 0) {
    return NextResponse.json(
      {
        error: "Invalid request",
        message: "Please provide either city name or coordinates",
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();

  // Upsert user preferences
  const { error } = await supabase.from("UserPreferences").upsert(
    {
      userId: session.user.id,
      ...locationData,
      updatedAt: new Date().toISOString(),
    },
    {
      onConflict: "userId",
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    location: {
      city: locationData.location_city,
      country: locationData.location_country,
      lat: locationData.location_lat,
      lon: locationData.location_lon,
    },
  });
}

// DELETE - Clear location
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("UserPreferences")
    .update({
      location_city: null,
      location_country: null,
      location_lat: null,
      location_lon: null,
      updatedAt: new Date().toISOString(),
    })
    .eq("userId", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
