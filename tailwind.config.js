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
      animation: {
        "fade-in": "fadeIn 0.8s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        widest: "0.15em",
        "super-wide": "0.2em",
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
            danger: {
              DEFAULT: "#DC2626",
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#16A34A",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#EA580C",
              foreground: "#FFFFFF",
            },
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
            danger: {
              DEFAULT: "#EF4444",
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#22C55E",
              foreground: "#000000",
            },
            warning: {
              DEFAULT: "#F97316",
              foreground: "#000000",
            },
          },
        },
      },
      layout: {
        radius: {
          small: "0px",
          medium: "0px",
          large: "0px",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    }),
  ],
};

module.exports = config;
