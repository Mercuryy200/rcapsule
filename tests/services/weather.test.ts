import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { getWeather, getWeatherSummary } from "@/lib/services/weather";

// Set required env var
beforeEach(() => {
  vi.stubEnv("OPENWEATHER_API_KEY", "test-key");
});

describe("getWeather", () => {
  it("returns a WeatherContext with correct structure", async () => {
    const weather = await getWeather(43.65, -79.38, "celsius");

    expect(weather).toMatchObject({
      current: expect.objectContaining({
        temperature: expect.any(Number),
        feelsLike: expect.any(Number),
        humidity: expect.any(Number),
        description: expect.any(String),
        condition: expect.any(String),
        windSpeed: expect.any(Number),
      }),
      high: expect.any(Number),
      low: expect.any(Number),
      isRainy: expect.any(Boolean),
      isCold: expect.any(Boolean),
      isHot: expect.any(Boolean),
      needsLayers: expect.any(Boolean),
      needsUmbrella: expect.any(Boolean),
      needsSunProtection: expect.any(Boolean),
    });
  });

  it("returns temperature as a rounded number", async () => {
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(Number.isInteger(weather.current.temperature)).toBe(true);
    expect(Number.isInteger(weather.high)).toBe(true);
    expect(Number.isInteger(weather.low)).toBe(true);
  });

  it("flags isCold when temperature is below 10°C", async () => {
    server.use(
      http.get("https://api.openweathermap.org/data/3.0/onecall", () =>
        HttpResponse.json({
          current: {
            temp: 5,
            feels_like: 3,
            humidity: 80,
            weather: [{ id: 800, description: "clear sky", icon: "01d" }],
            wind_speed: 10,
            uvi: 1,
            sunrise: 1700000000,
            sunset: 1700040000,
          },
          hourly: [{ pop: 0 }],
          daily: [{ temp: { max: 7, min: 2 }, pop: 0 }],
        }),
      ),
    );
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(weather.isCold).toBe(true);
    expect(weather.isHot).toBe(false);
  });

  it("flags isHot when temperature is above 25°C", async () => {
    server.use(
      http.get("https://api.openweathermap.org/data/3.0/onecall", () =>
        HttpResponse.json({
          current: {
            temp: 30,
            feels_like: 32,
            humidity: 50,
            weather: [{ id: 800, description: "sunny", icon: "01d" }],
            wind_speed: 3,
            uvi: 8,
            sunrise: 1700000000,
            sunset: 1700040000,
          },
          hourly: [{ pop: 0 }],
          daily: [{ temp: { max: 33, min: 24 }, pop: 0 }],
        }),
      ),
    );
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(weather.isHot).toBe(true);
    expect(weather.isCold).toBe(false);
  });

  it("flags needsUmbrella when rain probability > 30%", async () => {
    server.use(
      http.get("https://api.openweathermap.org/data/3.0/onecall", () =>
        HttpResponse.json({
          current: {
            temp: 15,
            feels_like: 13,
            humidity: 90,
            weather: [{ id: 500, description: "light rain", icon: "10d" }],
            wind_speed: 8,
            uvi: 1,
            sunrise: 1700000000,
            sunset: 1700040000,
          },
          hourly: [{ pop: 0.5 }],
          daily: [{ temp: { max: 17, min: 12 }, pop: 0.5 }],
        }),
      ),
    );
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(weather.needsUmbrella).toBe(true);
    expect(weather.isRainy).toBe(true);
  });

  it("flags needsLayers when temp swing > 10°C", async () => {
    server.use(
      http.get("https://api.openweathermap.org/data/3.0/onecall", () =>
        HttpResponse.json({
          current: {
            temp: 18,
            feels_like: 16,
            humidity: 60,
            weather: [{ id: 800, description: "clear sky", icon: "01d" }],
            wind_speed: 5,
            uvi: 4,
            sunrise: 1700000000,
            sunset: 1700040000,
          },
          hourly: [{ pop: 0 }],
          daily: [{ temp: { max: 25, min: 8 }, pop: 0 }], // 17°C swing
        }),
      ),
    );
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(weather.needsLayers).toBe(true);
  });

  it("falls back to current weather API when OneCall fails", async () => {
    server.use(
      http.get("https://api.openweathermap.org/data/3.0/onecall", () =>
        HttpResponse.json({ message: "quota exceeded" }, { status: 401 }),
      ),
    );
    const weather = await getWeather(43.65, -79.38, "celsius");
    expect(weather.current.temperature).toBeDefined();
  });

  it("throws when API key is missing", async () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    await expect(getWeather(43.65, -79.38, "celsius")).rejects.toThrow(
      "OPENWEATHER_API_KEY is not configured",
    );
  });
});

describe("getWeatherSummary", () => {
  it("returns a non-empty string summary", async () => {
    const weather = await getWeather(43.65, -79.38, "celsius");
    const summary = getWeatherSummary(weather);
    expect(typeof summary).toBe("string");
    expect(summary.length).toBeGreaterThan(0);
  });

  it("includes temperature in the summary", async () => {
    const weather = await getWeather(43.65, -79.38, "celsius");
    const summary = getWeatherSummary(weather);
    expect(summary).toContain("°C");
  });
});
