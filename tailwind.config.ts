import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        regime: "#8B0000",
        alliance: "#0033FF",
        sdf: "#FFD700",
        rebels: "#008000",
        axis: "#FFFFFF",
        isis: "#000000",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255,255,255,0.4)",
      },
    },
  },
} satisfies Config;
