const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#0D3B2E",
        "primary-hover": "#0A2E24",
        "primary-foreground": "#FAFAF8",
        accent: "#E8621A",
        "accent-hover": "#C9521A",
        "accent-foreground": "#FFFFFF",
        amber: "#F4A61D",
        "amber-foreground": "#1A1A18",
        // Surface
        background: "#F2F2EF",
        surface: "#FAFAF8",
        "surface-2": "#EFEFEB",
        border: "#E2E2DC",
        "border-strong": "#C8C8C0",
        // Text
        text: "#1A1A18",
        "text-secondary": "#4A4A45",
        "text-muted": "#8A8A82",
        "text-disabled": "#B8B8B0",
        // Semantic
        success: "#16A34A",
        "success-bg": "#DCFCE7",
        warning: "#D97706",
        "warning-bg": "#FEF3C7",
        destructive: "#DC2626",
        "destructive-bg": "#FEE2E2",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        display: ["Fraunces_700Bold"],
        "display-semibold": ["Fraunces_600SemiBold"],
        "display-regular": ["Fraunces_400Regular"],
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-bold": ["DMSans_700Bold"],
      },
    },
  },
  plugins: [],
};
