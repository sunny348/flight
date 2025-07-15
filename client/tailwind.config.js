/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF5FF',
          100: '#D5E5FF',
          200: '#ADC8FF',
          300: '#84A9FF',
          400: '#6690FF',
          500: '#3366FF', // Main primary color
          600: '#254EDB',
          700: '#1939B7',
          800: '#102693',
          900: '#091A7A',
        },
        secondary: {
          50: '#F8F9FC',
          100: '#F1F3F9',
          200: '#E3E7F0',
          300: '#D0D5E0',
          400: '#9AA1B9',
          500: '#717899', // Main secondary color
          600: '#4A516E',
          700: '#2C324B',
          800: '#161D36',
          900: '#0A0F29',
        },
        accent: {
          50: '#FFEDE6',
          100: '#FFD1C2',
          200: '#FFB199',
          300: '#FF9270',
          400: '#FF7A53',
          500: '#FF5722', // Main accent color
          600: '#DB4315',
          700: '#B7300B',
          800: '#932005',
          900: '#7A1602',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/forms')],
}; 