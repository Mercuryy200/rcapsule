// Weather service using OpenWeatherMap API (free tier: 1000 calls/day)
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  condition: WeatherCondition;
  icon: string;
  windSpeed: number;
  precipitation: number; // probability 0-100
  uvIndex: number;
  sunrise: Date;
  sunset: Date;
}

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "windy"
  | "foggy";

export interface WeatherContext {
  current: WeatherData;
  high: number;
  low: number;
  isRainy: boolean;
  isCold: boolean; // below 10°C
  isHot: boolean; // above 25°C
  needsLayers: boolean; // high temp variance
  needsUmbrella: boolean;
  needsSunProtection: boolean;
}

// Map OpenWeatherMap condition codes to our simplified conditions
function mapCondition(code: number): WeatherCondition {
  if (code >= 200 && code < 300) return "stormy"; // Thunderstorm
  if (code >= 300 && code < 400) return "rainy"; // Drizzle
  if (code >= 500 && code < 600) return "rainy"; // Rain
  if (code >= 600 && code < 700) return "snowy"; // Snow
  if (code >= 700 && code < 800) return "foggy"; // Atmosphere (fog, mist)
  if (code === 800) return "clear"; // Clear
  if (code > 800) return "cloudy"; // Clouds

  return "clear";
}

export async function getWeather(
  lat: number,
  lon: number,
  units: "celsius" | "fahrenheit" = "celsius",
): Promise<WeatherContext> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is not configured");
  }

  const unitParam = units === "celsius" ? "metric" : "imperial";

  // Fetch current weather and forecast in one call using OneCall API
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${unitParam}&exclude=minutely,alerts&appid=${apiKey}`,
    { next: { revalidate: 1800 } }, // Cache for 30 minutes
  );

  if (!response.ok) {
    // Fallback to free current weather API if OneCall not available
    return getWeatherFallback(lat, lon, units);
  }

  const data = await response.json();

  const current: WeatherData = {
    temperature: Math.round(data.current.temp),
    feelsLike: Math.round(data.current.feels_like),
    humidity: data.current.humidity,
    description: data.current.weather[0].description,
    condition: mapCondition(data.current.weather[0].id),
    icon: data.current.weather[0].icon,
    windSpeed: Math.round(data.current.wind_speed),
    precipitation: data.hourly?.[0]?.pop
      ? Math.round(data.hourly[0].pop * 100)
      : 0,
    uvIndex: Math.round(data.current.uvi || 0),
    sunrise: new Date(data.current.sunrise * 1000),
    sunset: new Date(data.current.sunset * 1000),
  };

  // Get today's high/low from daily forecast
  const todayForecast = data.daily?.[0];
  const high = todayForecast
    ? Math.round(todayForecast.temp.max)
    : current.temperature + 3;
  const low = todayForecast
    ? Math.round(todayForecast.temp.min)
    : current.temperature - 3;

  // Calculate precipitation chance for today
  const rainChance = todayForecast?.pop
    ? Math.round(todayForecast.pop * 100)
    : current.precipitation;

  return {
    current,
    high,
    low,
    isRainy:
      current.condition === "rainy" ||
      current.condition === "stormy" ||
      rainChance > 50,
    isCold: current.temperature < 10,
    isHot: current.temperature > 25,
    needsLayers: high - low > 10,
    needsUmbrella: rainChance > 30,
    needsSunProtection: current.uvIndex >= 6,
  };
}

// Fallback using free Current Weather API (if OneCall quota exceeded)
async function getWeatherFallback(
  lat: number,
  lon: number,
  units: "celsius" | "fahrenheit" = "celsius",
): Promise<WeatherContext> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const unitParam = units === "celsius" ? "metric" : "imperial";

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unitParam}&appid=${apiKey}`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  const current: WeatherData = {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    condition: mapCondition(data.weather[0].id),
    icon: data.weather[0].icon,
    windSpeed: Math.round(data.wind?.speed || 0),
    precipitation: data.rain ? 80 : data.clouds?.all > 70 ? 40 : 10,
    uvIndex: 5, // Not available in free API
    sunrise: new Date(data.sys.sunrise * 1000),
    sunset: new Date(data.sys.sunset * 1000),
  };

  return {
    current,
    high: Math.round(data.main.temp_max),
    low: Math.round(data.main.temp_min),
    isRainy: current.condition === "rainy" || current.condition === "stormy",
    isCold: current.temperature < 10,
    isHot: current.temperature > 25,
    needsLayers: data.main.temp_max - data.main.temp_min > 10,
    needsUmbrella:
      current.condition === "rainy" || current.condition === "stormy",
    needsSunProtection:
      current.condition === "clear" && current.temperature > 20,
  };
}

// Helper to get weather description for AI prompt
export function getWeatherSummary(weather: WeatherContext): string {
  const parts: string[] = [];

  parts.push(
    `${weather.current.temperature}°C (feels like ${weather.current.feelsLike}°C)`,
  );
  parts.push(weather.current.description);

  if (weather.high !== weather.low) {
    parts.push(`high of ${weather.high}°C, low of ${weather.low}°C`);
  }

  if (weather.needsUmbrella) {
    parts.push(`${weather.current.precipitation}% chance of rain`);
  }

  if (weather.current.windSpeed > 20) {
    parts.push(`windy (${weather.current.windSpeed} km/h)`);
  }

  if (weather.needsSunProtection) {
    parts.push(`UV index: ${weather.current.uvIndex}`);
  }

  return parts.join(", ");
}
