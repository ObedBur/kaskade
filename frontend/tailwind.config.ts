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
      },
      colors: {
        primary: "#FF6B00", // Ton orange
        dark: "#1A1D21",    // Ton noir
      }
    },
  },
  plugins: [],
};
export default config;