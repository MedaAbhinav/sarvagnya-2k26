/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1628',
        },
        ivory: {
          50: '#fdfcf7',
          100: '#f9f6ec',
          200: '#f0ead4',
          300: '#e4d9b6',
          400: '#d4c08a',
          500: '#c4a75e',
        },
        gold: {
          300: '#e8d5a3',
          400: '#d4af6a',
          500: '#c49a38',
          600: '#a67c20',
        },
        burgundy: {
          500: '#722f37',
          600: '#5c1f26',
          700: '#4a1218',
          800: '#370d12',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-up': 'fadeUp 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'slow-zoom': 'slowZoom 20s ease-out forwards',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(90deg, #c49a38 0%, #e8d5a3 50%, #c49a38 100%)',
      },
    },
  },
  plugins: [],
}
