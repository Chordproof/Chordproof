/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          accent: "#1ED760",
          dark: "#121212",
          elevated: "#1A1A1A",
          tinted: "#282828",
          text: "#E0E0E0",
          muted: "#A7A7A7",
          disabled: "#6A6A6A",
          error: "#CF6679",
          warning: "#FFA42B",
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
