/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 24px 80px rgba(209, 107, 74, 0.22)',
      },
    },
  },
  plugins: [],
}
