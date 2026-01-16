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
            background: {
              DEFAULT: "#FFFFFF",
              foreground: "#171717",
            },
            primary: {
              DEFAULT: "#171717",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#E5E5E5",
              foreground: "#171717",
            },
            focus: "#171717",
          },
        },
        dark: {
          colors: {
            background: {
              DEFAULT: "#000000",
              foreground: "#EDEDED",
            },
            primary: {
              DEFAULT: "#FFFFFF",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#262626",
              foreground: "#FFFFFF",
            },
            focus: "#FFFFFF",
          },
        },
      },
    }),
  ],
};

module.exports = config;
