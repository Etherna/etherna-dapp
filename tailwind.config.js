const plugin = require("tailwindcss/plugin")
const colors = require("tailwindcss/colors")

module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "360px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        primary: {
          50: "#E6FAF6",
          100: "#B3F0E4",
          200: "#81E7D2",
          300: "#4FDDBF",
          400: "#1CD3AD",
          500: "#03CEA4",
          600: "#03B994",
          700: "#029073",
          800: "#026752",
          900: "#013E31",
        },
        light: "#fefefe",
        dark: "#222222",
        navigation: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
      },
      spacing: {
        120: "30rem",
      },
      hueRotate: {
        "-180": "-180deg",
        "-90": "-90deg",
        "-60": "-60deg",
        "-30": "-30deg",
        "-15": "-15deg",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Roboto",
          "\"Helvetica Neue\"",
          "sans-serif",
          "\"Apple Color Emoji\"",
          "\"Segoe UI Emoji\"",
          "\"Segoe UI Symbol\"",
          "\"Noto Color Emoji\"",
        ],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        md: ["1.15rem", { lineHeight: "1.5rem" }],
      },
      maxWidth: {
        xxs: "14rem",
      },
      minWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "72rem",
      },
      minHeight: ({ theme }) => ({
        ...theme("spacing")
      }),
      zIndex: {
        "-1": "-1",
        1: "1",
        100: "100",
        200: "200",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addUtilities }) {
      const utils = {
        ".absolute-center": {
          "position": "absolute",
          "left": "50%",
          "top": "50%",
          "--tw-translate-x": "-50%",
          "--tw-translate-y": "-50%",
          "transform": "var(--tw-transform)",
        }
      }

      addUtilities(utils, ["responsive"])
    }),
  ],
}
