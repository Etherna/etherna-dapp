module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  settings: {
    react: {
      version: "18",
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  parser: "@typescript-eslint/parser",
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  plugins: ["react", "@typescript-eslint", "prettier", "jsx-a11y"],
  ignorePatterns: ["*/build/*", "public/*", "node_modules/*"],
  rules: {
    "prettier/prettier": ["warn"],
    "@typescript-eslint/consistent-type-imports": ["error"],
    semi: ["error", "never"],
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["error", { allow: ["info", "warn", "error", "debug", "table", "group", "groupEnd"] }]
        : "off",
    "react/self-closing-comp": ["warn", { component: true, html: true }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
  },
}
