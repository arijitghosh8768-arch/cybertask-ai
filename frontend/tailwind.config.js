/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a12',
          card: 'rgba(17, 17, 28, 0.7)',
          accent: '#00f0ff',
          neonPink: '#ff007f',
          neonPurple: '#9d00ff',
          neonGreen: '#39ff14',
          text: '#e2e8f0',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4)',
        'neon-green': '0 0 15px rgba(57, 255, 20, 0.4)'
      }
    },
  },
  plugins: [],
}
