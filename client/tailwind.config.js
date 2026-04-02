// client/tailwind.config.js
// Tailwind config — adds dark mode class-based toggle

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class", // Dark mode is toggled by adding 'dark' class to <html>
  theme: {
    extend: {
      colors: {
        // Custom brand colors — consistent across the whole app
        primary: {
          50:  "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};