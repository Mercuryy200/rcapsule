import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#e1dbc9",
            foreground: "#11181C",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2d4530",
            },
            secondary: {
              foreground: "#11181C",
              DEFAULT: "#6b7884",
            },
            danger: {
              foreground: "#660810",
              DEFAULT: "#660810",
            },
            warning: {
              DEFAULT: "#5e4b3b",
              foreground: "#FFFFFF",
            },
            focus: "#2d4530",
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              foreground: "#ECEDEE",
              DEFAULT: "#2d4530",
            },
            secondary: {
              foreground: "#ECEDEE",
              DEFAULT: "#6b7884",
            },
            danger: {
              foreground: "#660810",
              DEFAULT: "#660810",
            },
            warning: {
              DEFAULT: "#5e4b3b",
              foreground: "#FFFFFF",
            },
            focus: "#2d4530",
          },
        },
      },
    }),
  ],
};

module.exports = config;
