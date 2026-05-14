import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Cela connecte la variable --font-sans définie dans layout.tsx
        sans: ["var(--font-sans)", "sans-serif"],
        // Cela connecte la variable --font-mono
        mono: ["var(--font-mono)", "monospace"],
        // Nouvelle police Serif pour le luxe
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        primary: "#FF6B00",
        dark: "#1A1D21",
        // Palette Luxe
        chocolat: "#321B13",
        ocre: "#BC9C6C",
        "off-white": "#FCFBF7",
      }
    },
  },
  plugins: [],
};
export default config;