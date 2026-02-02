/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#4F46E5",
        "secondary": "#818CF8",
        "cta": "#22C55E",
        "background-light": "#F8FAFC",
        "background-dark": "#1f242e",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"],
        "technical": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
