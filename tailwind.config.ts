import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Components live under src/app/components and src/lib; the two globs below
    // cover them. (There is no src/pages or src/components directory, so the
    // old entries scanned nothing.)
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colour values live in globals.css as CSS custom properties so the dark
      // and light schemes stay in one place; these map Tailwind utilities onto
      // those tokens instead of duplicating hex values.
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-secondary)",
        accent: "var(--accent-primary)",
        "accent-faint": "var(--accent-glow)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
