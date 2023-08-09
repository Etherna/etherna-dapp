module.exports = {
  htmlWhitespaceSensitivity: "ignore",
  printWidth: 100,
  singleQuote: false,
  semi: false,
  useTabs: false,
  proseWrap: "always",
  arrowParens: "avoid",
  bracketSpacing: true,
  trailingComma: "es5",
  importOrder: [
    "",
    "^react",
    "<THIRD_PARTY_MODULES>",
    "",
    ".s?css$",
    "^@heroicons",
    "^@/assets",
    "",
    "^[./]",
    "^@/",
    "",
    "<TYPES>^[./]",
    "<TYPES>^react",
    "<TYPES>^@/",
    "<TYPES>",
  ],
  importOrderTypeScriptVersion: "5.0.0",
  tailwindConfig: "./tailwind.config.ts",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
}
