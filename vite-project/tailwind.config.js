/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none'
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none', // IE and Edge
          'scrollbar-width': 'none' // Firefox
        }
      })
    }
  ],
}