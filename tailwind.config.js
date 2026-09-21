/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Class strategy — ThemeContext toggles `dark` on <html>.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral scale — theme-aware (values in index.css :root / .dark).
        // 900 = page background, 800 = raised surface, 700/600 = borders,
        // 500 → 100 = text from faint to primary. Light mode inverts it.
        spirit: Object.fromEntries(
          [950, 900, 800, 700, 600, 500, 400, 300, 200, 100].map((n) => [
            n,
            `rgb(var(--spirit-${n}) / <alpha-value>)`,
          ])
        ),
        // Accent (blue) — theme-aware; light mode shifts a step darker for contrast
        accent: Object.fromEntries(
          [600, 500, 400, 300, 100].map((n) => [n, `rgb(var(--accent-${n}) / <alpha-value>)`])
        ),
        flame: {
          500: '#E8603C',
          400: '#F07858',
        },
        // Landing page theme tokens — values live in index.css (:root / .dark)
        lp: {
          bg: 'rgb(var(--lp-bg) / <alpha-value>)',
          fg: 'rgb(var(--lp-fg) / <alpha-value>)',
          accent: 'rgb(var(--lp-accent) / <alpha-value>)',
          'accent-soft': 'rgb(var(--lp-accent-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
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
