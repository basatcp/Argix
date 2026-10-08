/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050B14', 900: '#07111F', 800: '#0A1424' },
        card: '#0E1B2C',
        primary: '#3B82F6',
        electric: '#1EA7FF',
        cyan: '#39D7FF',
        text: '#F7F9FC',
        muted: '#9BA8BA',
        line: 'rgba(90, 150, 220, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: { site: '1240px' },
      borderRadius: { card: '20px', btn: '13px' },
    },
  },
  plugins: [],
};
