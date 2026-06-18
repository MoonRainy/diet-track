/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EAF3DE',
          100: '#C0DD97',
          200: '#97C459',
          300: '#7AB830',
          400: '#639922',
          500: '#3B6D11',
          600: '#27500A',
          700: '#173404',
          800: '#0E2202',
        },
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
        },
        surface: {
          primary:   'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary:  'var(--surface-tertiary)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { DEFAULT: '8px', lg: '12px', xl: '16px', '2xl': '20px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
