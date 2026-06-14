/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gmail-bg': '#f6f8fc',
        'gmail-surface': '#ffffff',
        'gmail-search': '#eaf1fb',
        'gmail-nav-selected': '#d3e3fd',
        'gmail-compose': '#c2e7ff',
        'gmail-text-primary': '#202124',
        'gmail-text-secondary': '#5f6368',
        'gmail-divider': '#e0e0e0',
        'gmail-hover': '#f2f6fc',
        'gmail-blue': '#1a73e8',
        'risk-low': '#188038',
        'risk-medium': '#f9ab00',
        'risk-high': '#d93025',
        'ai-accent': '#5e35b1',
      },
      fontFamily: {
        sans: ['Google Sans', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
