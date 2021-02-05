const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      height: {
        'control-sliders': '44%',
        'waypoint-control': '54%'
      }
    },
    colors: colors
  },
  variants: {
    extend: {
      ringWidth: ['hover'],
      opacity: ['group-hover']
    },
  },
  plugins: [],
}
