// Tailwind CSS v4 — primary configuration is in src/app/globals.css via @theme.
// This file is kept for tooling compatibility (IDE intellisense).
// Colors, fonts, and animations are defined with CSS @theme in globals.css.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
};

export default config;
