/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        ink: "#0C0A09",
        charcoal: "#1C1917",
        slate: "#44403C",
        cream: "#FAFAF9",
        parchment: "#F3F1EC",
        gold: {
          DEFAULT: "#A16207",
          light: "#C88A2E",
          soft: "#E8CFA0",
        },
        ember: {
          DEFAULT: "#E2582A",
          soft: "#F0794A",
        },
        border: "#D6D3D1",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        wordmark: ["Cormorant", "'Playfair Display'", "serif"],
        body: ["Inter", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
