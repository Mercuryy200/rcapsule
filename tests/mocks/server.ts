import { setupServer } from "msw/node";
import { openWeatherHandlers } from "./handlers/openweather";
import { openAiHandlers } from "./handlers/openai";

export const server = setupServer(
  ...openWeatherHandlers,
  ...openAiHandlers,
);
