const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./content/**/*.md", "./content/**/*.html", "./layouts/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto Flex", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
