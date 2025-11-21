/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../templates/**/*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        "panel-neutral": "rgba(17, 24, 39, 0.55)",
        "panel-light": "rgba(255, 255, 255, 0.08)",
        "chart-start": "#f9aa31",
        "chart-end": "#f37322",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.45)",
      },
      backdropBlur: {
        glass: "22px",
      },
    },
  },
  plugins: [],
};

