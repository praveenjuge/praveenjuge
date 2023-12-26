module.exports = {
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      keyframes: {
        slide: {
          to: { transform: 'translateX(-69%)' }
        }
      }
    }
  }
};
