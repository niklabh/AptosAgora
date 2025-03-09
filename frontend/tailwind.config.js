/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          900: '#4A148C',
          800: '#6A1B9A',
          700: '#7B1FA2',
          600: '#8E24AA',
          500: '#9C27B0',
          400: '#AB47BC',
          300: '#BA68C8',
          200: '#CE93D8',
          100: '#E1BEE7',
          50: '#F3E5F5',
        },
        indigo: {
          900: '#1A237E',
          800: '#283593',
          700: '#303F9F',
          600: '#3949AB',
          500: '#3F51B5',
          400: '#5C6BC0',
          300: '#7986CB',
          200: '#9FA8DA',
          100: '#C5CAE9',
          50: '#E8EAF6',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 