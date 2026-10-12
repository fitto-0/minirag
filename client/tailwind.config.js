/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Paper & ink" palette. The neu-* names are kept so every page shares one theme.
        neu: {
          bg: '#f4f2ee',
          light: '#fbfaf7',
          dark: '#e4e0d8',
          shadow: '#d9d4ca',
          highlight: '#ffffff',
          text: '#17161c',
          muted: '#6f6b75',
          accent: '#3442d9',
          'accent-dark': '#2733b8',
        },
        ink: {
          DEFAULT: '#17161c',
          soft: '#2a2931',
        },
        marker: '#ffe27a',
        coral: '#ff7a59',
        mint: '#3fb68b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'neu-flat': '0 1px 2px rgba(23,22,28,0.04), 0 8px 24px -12px rgba(23,22,28,0.12)',
        'neu-pressed': 'inset 0 1px 2px rgba(23,22,28,0.08)',
        'neu-float': '0 2px 4px rgba(23,22,28,0.04), 0 24px 48px -16px rgba(23,22,28,0.18)',
        'neu-sm': '0 1px 2px rgba(23,22,28,0.05), 0 4px 12px -6px rgba(23,22,28,0.12)',
        'neu-inset-sm': 'inset 0 1px 2px rgba(23,22,28,0.06)',
        'neu-accent': '0 8px 20px -8px rgba(52,66,217,0.55)',
      },
      borderRadius: {
        'neu': '16px',
        'neu-sm': '12px',
        'neu-lg': '24px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-25px, 20px) scale(0.95)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        drift: 'drift 18s ease-in-out infinite',
        'drift-slow': 'drift 26s ease-in-out infinite reverse',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
