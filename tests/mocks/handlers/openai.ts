import { http, HttpResponse } from "msw";

export const mockOutfitRecommendation = {
  items: [
    { id: "clothes-1", name: "White T-Shirt", category: "Tops", reason: "Breathable for warm weather" },
    { id: "clothes-2", name: "Blue Jeans", category: "Bottoms", reason: "Versatile everyday wear" },
  ],
  reasoning: "A classic casual look suitable for today's mild weather.",
  styleNotes: "Tuck in the shirt for a more polished look.",
  weatherConsiderations: "Light fabrics are ideal for 18°C.",
  alternativeIds: [],
};

export const openAiHandlers = [
  http.post("https://api.openai.com/v1/chat/completions", () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify(mockOutfitRecommendation),
          },
        },
      ],
    });
  }),

  http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json({
      content: [{ text: JSON.stringify(mockOutfitRecommendation) }],
    });
  }),
];
