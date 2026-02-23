import { http, HttpResponse } from "msw";

export const mockWeatherResponse = {
  current: {
    temp: 18,
    feels_like: 16,
    humidity: 65,
    weather: [{ id: 800, description: "clear sky", icon: "01d" }],
    wind_speed: 5,
    uvi: 3,
    sunrise: 1700000000,
    sunset: 1700040000,
  },
  hourly: [{ pop: 0.1 }],
  daily: [{ temp: { max: 22, min: 12 }, pop: 0.1 }],
};

export const mockCurrentWeatherResponse = {
  main: {
    temp: 18,
    feels_like: 16,
    humidity: 65,
    temp_max: 22,
    temp_min: 12,
  },
  weather: [{ id: 800, description: "clear sky", icon: "01d" }],
  wind: { speed: 5 },
  clouds: { all: 10 },
  sys: { sunrise: 1700000000, sunset: 1700040000 },
};

export const openWeatherHandlers = [
  http.get("https://api.openweathermap.org/data/3.0/onecall", () => {
    return HttpResponse.json(mockWeatherResponse);
  }),
  http.get("https://api.openweathermap.org/data/2.5/weather", () => {
    return HttpResponse.json(mockCurrentWeatherResponse);
  }),
];
