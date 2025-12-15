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
              foreground: "#000000",
              DEFAULT: "#f4ede4",
            },
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#a8a8a8",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#a67b5b",
            },
         
          },
        },
      },
}),
  ],
};

module.exports = config;
