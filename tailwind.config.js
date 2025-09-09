/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./**/*.js"],
  theme: {
    extend: {
      backgroundImage: {
        home: "url('/Assets/M3-ENERGIZA.png')", // sua imagem de fundo
      },
    },
  },
  plugins: [],
};