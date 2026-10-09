/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#064e3b',
          forest: '#065f46',
          emerald: '#059669',
          light: '#10b981',
          bg: '#f8fafc',
          accent: '#f59e0b',
          amber: '#d97706',
          charcoal: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
