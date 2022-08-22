const plugin = require("tailwindcss/plugin")

/** @type {import('tailwindcss/types').Config} */
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
          50: "#EBFCFF",
          100: "#DAF6FA",
          200: "#B1F2FA",
          300: "#79E1ED",
          400: "#34C7D9",
          500: "#00AABE",
          600: "#0090A1",
          700: "#006D7A",
          800: "#004B54",
          900: "#003238",
        },
        light: "#fefefe",
        dark: "#222222",
        navigation: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
      },
      spacing: {
        container: "1rem",
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
        md: ["1.125rem", { lineHeight: "1.5rem" }],
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
      animation: {
        "spinSlow": "spinSlow 2s linear infinite",
        "slide": "slide 2s cubic-bezier(0.2, 0.7, 0.7, 0.4) infinite",
      },
      keyframes: {
        spinSlow: {
          "from": { transform: "rotate(360deg)" },
          "to": { transform: "rotate(0deg)" },
        },
        slide: {
          "0%": {
            left: "-100%",
          },
          "100%": {
            left: "100%",
          },
        },
      },
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
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
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
