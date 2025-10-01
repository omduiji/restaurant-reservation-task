/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#440099',
          200: '#44009980', // 50% opacity
          300: '#44009966', // 40% opacity
          400: '#4400994d', // 30% opacity
          500: '#44009933', // 20% opacity
          600: '#4400991a', // 10% opacity
          700: '#440099bf', // 75% opacity
        },
      },
    },
  },
  plugins: [],
}
