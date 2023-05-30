module.exports = {
  plugins: [
    require("tailwindcss")("./tailwind.config.js"),
    ...(process.env.HUGO_ENVIRONMENT === "production"
      ? [require("autoprefixer")]
      : []),
  ],
};
