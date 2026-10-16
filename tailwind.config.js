module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "var(--c-gold)",
          dark: "var(--c-bg)",
          card: "var(--c-card)",
          text: "var(--c-text)",
          muted: "var(--c-muted)",
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
