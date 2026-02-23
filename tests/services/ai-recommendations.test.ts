import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import {
  getOutfitRecommendation,
  getOutfitOptions,
  type ClothingItem,
} from "@/lib/services/ai-recommendations";
import type { WeatherContext } from "@/lib/services/weather";

const mockClothes: ClothingItem[] = [
  {
    id: "clothes-1",
    name: "White T-Shirt",
    category: "Tops",
    colors: ["white"],
    season: ["spring", "summer"],
    placesToWear: ["casual", "everyday"],
    style: "casual",
    materials: ["cotton"],
    imageUrl: "https://example.com/tshirt.jpg",
  },
  {
    id: "clothes-2",
    name: "Blue Jeans",
    category: "Bottoms",
    colors: ["blue"],
    season: ["all-season"],
    placesToWear: ["casual", "everyday"],
    style: "casual",
    materials: ["denim"],
    imageUrl: "https://example.com/jeans.jpg",
  },
  {
    id: "clothes-3",
    name: "Black Sneakers",
    category: "Shoes",
    colors: ["black"],
    season: ["all-season"],
    placesToWear: ["casual"],
    style: "casual",
    materials: ["leather"],
  },
];

const mockWeather: WeatherContext = {
  current: {
    temperature: 18,
    feelsLike: 16,
    humidity: 65,
    description: "clear sky",
    condition: "clear",
    icon: "01d",
    windSpeed: 5,
    precipitation: 10,
    uvIndex: 3,
    sunrise: new Date(),
    sunset: new Date(),
  },
  high: 22,
  low: 12,
  isRainy: false,
  isCold: false,
  isHot: false,
  needsLayers: false,
  needsUmbrella: false,
  needsSunProtection: false,
};

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
});

describe("getOutfitRecommendation", () => {
  it("returns a valid outfit recommendation", async () => {
    const result = await getOutfitRecommendation(mockClothes, {
      weather: mockWeather,
    });

    expect(result).toMatchObject({
      items: expect.any(Array),
      reasoning: expect.any(String),
      styleNotes: expect.any(String),
      weatherConsiderations: expect.any(String),
    });
  });

  it("only returns items that exist in the provided wardrobe", async () => {
    const result = await getOutfitRecommendation(mockClothes, {
      weather: mockWeather,
    });

    const validIds = new Set(mockClothes.map((c) => c.id));
    result.items.forEach((item) => {
      expect(validIds.has(item.id)).toBe(true);
    });
  });

  it("enriches items with imageUrl from original clothes data", async () => {
    const result = await getOutfitRecommendation(mockClothes, {
      weather: mockWeather,
    });

    const tshirt = result.items.find((i) => i.id === "clothes-1");
    if (tshirt) {
      expect(tshirt.imageUrl).toBe("https://example.com/tshirt.jpg");
    }
  });

  it("throws when fewer than 2 owned clothes are provided", async () => {
    const singleItem = [mockClothes[0]];
    await expect(
      getOutfitRecommendation(singleItem, { weather: mockWeather }),
    ).rejects.toThrow("Not enough clothes");
  });

  it("uses Claude when provider is anthropic and ANTHROPIC_API_KEY is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    const result = await getOutfitRecommendation(
      mockClothes,
      { weather: mockWeather },
      "anthropic",
    );
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("handles AI response wrapped in markdown code blocks", async () => {
    server.use(
      http.post("https://api.openai.com/v1/chat/completions", () =>
        HttpResponse.json({
          choices: [
            {
              message: {
                content: "```json\n" + JSON.stringify({
                  items: [{ id: "clothes-1", name: "White T-Shirt", category: "Tops", reason: "Good for weather" }],
                  reasoning: "Nice outfit",
                  styleNotes: "Tuck in",
                  weatherConsiderations: "Appropriate",
                }) + "\n```",
              },
            },
          ],
        }),
      ),
    );
    const result = await getOutfitRecommendation(mockClothes, { weather: mockWeather });
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("throws when OpenAI API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    await expect(
      getOutfitRecommendation(mockClothes, { weather: mockWeather }),
    ).rejects.toThrow("OPENAI_API_KEY is not configured");
  });

  it("throws when the API returns an error", async () => {
    server.use(
      http.post("https://api.openai.com/v1/chat/completions", () =>
        HttpResponse.json(
          { error: { message: "Rate limit exceeded" } },
          { status: 429 },
        ),
      ),
    );
    await expect(
      getOutfitRecommendation(mockClothes, { weather: mockWeather }),
    ).rejects.toThrow();
  });
});

describe("getOutfitOptions", () => {
  it("returns the requested number of outfit options", async () => {
    const results = await getOutfitOptions(mockClothes, { weather: mockWeather }, 2);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("returns an empty array when the API consistently returns errors", async () => {
    server.use(
      http.post("https://api.openai.com/v1/chat/completions", () =>
        HttpResponse.json({ error: { message: "Service unavailable" } }, { status: 503 }),
      ),
    );
    const results = await getOutfitOptions(mockClothes, { weather: mockWeather }, 3);
    expect(results).toEqual([]);
  });
});
