/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        compass: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          navy: "#0F172A",
          teal: "#0D9488",
          emerald: "#059669",
          amber: "#D97706",
          rose: "#E11D48",
          border: "#E2E8F0",
          subtle: "#64748B",
        }
      }
    },
  },
  plugins: [],
}
