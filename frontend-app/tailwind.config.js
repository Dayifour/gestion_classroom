// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ceci inclura tous tes composants React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}