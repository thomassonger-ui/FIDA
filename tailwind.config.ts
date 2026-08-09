import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Florida Institute of Dental Assisting palette
        navy: {
          DEFAULT: "#102A43",
          deep: "#0B1E33",
          soft: "#1F3A5F",
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
        },
        // WCAG 2.1 AA note (2026-08-09 audit): the original brand teal
        // #2CB1BC measures 2.59:1 on white — it fails AA for text (needs
        // 4.5:1) and as a button background under white text. DEFAULT is now
        // the accessible deepened teal. Keep it that way.
        //   #157782 → 5.26:1 on white · 4.76:1 on #F0F4F8 · 4.73:1 on #E6F6F7
        teal: {
          DEFAULT: "#157782",
          deep: "#106C74", // hover state — 6.14:1 under white text
          soft: "#5BC8D0", // light-on-dark ONLY (7.4:1 on navy). Never on white.
          bright: "#2CB1BC", // legacy brand tone — decorative fills only, never text
          50: "#E6F6F7",
        },
        paper: "#FFFFFF",
        "paper-subtle": "#F0F4F8",
        ink: "#0B1E33",
        muted: "#52677B",
        subtle: "#5D7086", // was #829AB1 (2.91:1 on white — failed AA). Now 5.09:1.
        rule: "#D9E2EC",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.08em",
        tight: "-0.01em",
      },
      maxWidth: {
        prose: "48rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,42,67,0.04), 0 4px 12px rgba(16,42,67,0.05)",
        lift: "0 4px 8px rgba(16,42,67,0.06), 0 16px 32px rgba(16,42,67,0.08)",
      },
      backgroundImage: {
        "hero-fade":
          "linear-gradient(90deg, rgba(16,42,67,0.92) 0%, rgba(16,42,67,0.78) 35%, rgba(16,42,67,0.35) 65%, rgba(16,42,67,0.12) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
