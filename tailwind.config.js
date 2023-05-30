const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./hugo_stats.json"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto Flex", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
