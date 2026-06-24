/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#eef0f4',
          light: '#f6f8fc',
          dark: '#d0d3da',
          shadow: '#c8cbd0',
          highlight: '#ffffff',
          text: '#2d3138',
          muted: '#8a8f99',
          accent: '#5b7cfa',
          'accent-dark': '#4a6ae0',
        },
      },
      boxShadow: {
        'neu-flat': '8px 8px 16px #c8cbd0, -8px -8px 16px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #c8cbd0, inset -4px -4px 8px #ffffff',
        'neu-float': '12px 12px 24px #c8cbd0, -12px -12px 24px #ffffff',
        'neu-sm': '4px 4px 8px #c8cbd0, -4px -4px 8px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 4px #c8cbd0, inset -2px -2px 4px #ffffff',
        'neu-accent': '6px 6px 12px #c8cbd0, -6px -6px 12px #ffffff',
      },
      borderRadius: {
        'neu': '16px',
        'neu-sm': '12px',
        'neu-lg': '24px',
      },
    },
  },
  plugins: [],
};
