/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          white: "#FFFFFF",
          blue: "#0066B2",
        },
        surface: {
          DEFAULT: "#000000",
          container: "#121212",
          "container-high": "#1E1E1E",
        },
        "on-surface": {
          DEFAULT: "#FFFFFF",
          variant: "#B3B3B3",
        },
        outline: "#2A2A2A",
        primary: {
          DEFAULT: "#0066B2",
          foreground: "#FFFFFF",
        },
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
};
