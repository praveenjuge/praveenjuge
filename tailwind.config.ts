module.exports = {
  content: ['./app/**/*.tsx'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      keyframes: {
        slide: {
          to: { transform: 'translateX(-169%)' }
        }
      }
    }
  }
};
