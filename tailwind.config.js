/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spirit: {
          950: '#07090F',
          900: '#0B0F1A',
          800: '#111827',
          700: '#1B2438',
          600: '#253150',
          500: '#334876',
          400: '#5A7AA8',
          300: '#8DA8CC',
          200: '#C0D0E6',
          100: '#E8EDF5',
        },
        gold: {
          600: '#A07830',
          500: '#C9A84C',
          400: '#D9BC72',
          300: '#EDD49A',
          100: '#FAF3E0',
        },
        flame: {
          500: '#E8603C',
          400: '#F07858',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'radial-spirit': 'radial-gradient(ellipse at 30% 20%, #1B2438 0%, #0B0F1A 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'flame': 'flameWave 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        flameWave: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1)' },
          '50%': { transform: 'scaleY(1.08) scaleX(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
