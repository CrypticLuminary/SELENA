import type { Config } from "tailwindcss";

/**
 * SELENA design tokens — editorial, human, calm.
 * Warm paper ground, warm-charcoal ink, one muted-teal accent, ochre caution.
 * A serif display face (Fraunces) carries editorial voice; Geist Sans carries UI.
 * Colors live as CSS variables in globals.css so the palette tunes in one place.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--ink-faint) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-deep": "rgb(var(--accent-deep) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        "accent-contrast": "rgb(var(--accent-contrast) / <alpha-value>)",
        caution: "rgb(var(--caution) / <alpha-value>)",
        "caution-soft": "rgb(var(--caution-soft) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      // Tokenized editorial type scale. [size, { lineHeight, letterSpacing }]
      fontSize: {
        display: ["clamp(2.5rem, 1.6rem + 3.6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        title: ["clamp(2.1rem, 1.5rem + 2.4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        section: ["clamp(1.6rem, 1.25rem + 1.5vw, 2.25rem)", { lineHeight: "1.14", letterSpacing: "-0.01em" }],
        story: ["clamp(1.9rem, 1.4rem + 2vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        card: ["1.2rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        lede: ["clamp(1.125rem, 1rem + 0.4vw, 1.3rem)", { lineHeight: "1.55" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        read: ["1.1rem", { lineHeight: "1.85" }],
        ui: ["0.9375rem", { lineHeight: "1.4" }],
        meta: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.06em" }],
      },
      maxWidth: {
        wide: "82.5rem", // 1320px — homepage wide bands, patterns dashboard
        editorial: "70rem", // 1120px — standard content width
        reading: "43rem", // 688px — prose / story column
        form: "47rem", // 752px — submission wizard
      },
      spacing: {
        section: "clamp(3.5rem, 2.2rem + 5vw, 8rem)", // 56 → 128 between major sections
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        // Restrained, soft shadows only — paper, not glass.
        soft: "0 1px 2px rgb(41 43 41 / 0.03), 0 6px 20px rgb(41 43 41 / 0.05)",
        lift: "0 2px 8px rgb(41 43 41 / 0.06), 0 16px 40px rgb(41 43 41 / 0.10)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
