/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mainBox': '#232539',
        'primary': '#A2AFF9',
        'textPrimary': '#CDD6F4',
      },
      fontFamily: {
        plaster: ["'Plaster', sans-serif"],
        sans: ["'Inter', sans-serif"],
      },
    },
  },
  plugins: [],
}

