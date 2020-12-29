module.exports = {
  theme: {
    extend: {
      colors: {
        deepOrange: "#E86120"
      }
    }
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "active", "dark", "dark-hover"],
    textColor: ["responsive", "hover", "focus", "active", "dark", "dark-hover"]
  },
  plugins: [
    require('tailwindcss-dark-mode')()
  ]
}
