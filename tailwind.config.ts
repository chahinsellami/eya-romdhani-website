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
        // Read from the next/font CSS variables so utilities like `font-display`
        // match the self-hosted files instead of a family that is not loaded.
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "spotlight": "spotlight 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        spotlight: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
