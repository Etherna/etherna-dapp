import plugin from "tailwindcss/plugin"

import type { Config } from "tailwindcss/types/config"

export default {
  content: ["./index.html", "./public/**/*.html", "./src/**/*.tsx"],
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
        15: "3.75rem",
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
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
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
        ...theme("spacing"),
      }),
      animation: {
        "tick-fade": "tick-fade 1.2s infinite",
        "tick-bounce": "tick-bounce 1.25s infinite alternate linear",
        spinSlow: "spinSlow 2s linear infinite",
        slide: "slide 2s cubic-bezier(0.2, 0.7, 0.7, 0.4) infinite",
        skip: "skip 1s cubic-bezier(0.2, 0.7, 0.7, 0.4) 0s 2 forwards",
      },
      keyframes: {
        "tick-bounce": {
          "0%": {
            transform: "translateX(-180%)",
          },
          "100%": {
            transform: "translateX(180%)",
          },
        },
        "tick-fade": {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0.1",
          },
        },
        spinSlow: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        slide: {
          "0%": {
            left: "-100%",
          },
          "100%": {
            left: "100%",
          },
        },
        skip: {
          "0%": {
            opacity: "0.2",
          },
          "70%": {
            opacity: "1",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)",
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
    require("tailwind-scrollbar"),
    require("tailwindcss-safe-area"),
    require("tailwindcss-interaction-media"),
    require("tailwindcss-animate"),
    require("@vidstack/react/tailwind.cjs"),
    plugin(({ addUtilities, addVariant, matchUtilities, theme }) => {
      const utils = {
        ".absolute-center": {
          position: "absolute",
          left: "50%",
          top: "50%",
          "--tw-translate-x": "-50%",
          "--tw-translate-y": "-50%",
          transform:
            "translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))",
        },
      }

      addUtilities(utils)

      matchUtilities(
        {
          "text-shadow": value => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      )

      addVariant(
        "landscape-touch",
        "@media (orientation: landscape) and (max-width: 1024px) and (pointer: coarse)"
      )
      addVariant("floating-sidebar", "[data-sidebar-floating='true'] &")
      addVariant("fixed-sidebar", "[data-sidebar-floating='false'] &")
    }),
  ],
} satisfies Config
