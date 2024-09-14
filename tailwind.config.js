/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'knf-pink': '#FF6B9A',
        'knf-darkblue': '#253C75',
        'knf-light': '#F9F5FA'
      },
    },
  },
  plugins: [],
}
