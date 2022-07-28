module.exports = {
  env: {
    browser: true,
    es2020: true,
    jest: true,
  },
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: {
    react: {
      version: "18",
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  ignorePatterns: ["*/build/**/*.js"],
  rules: {
    "max-len": [
      "warn",
      {
        code: 120,
      },
    ],
    semi: ["error", "never"],
    "no-console": process.env.NODE_ENV === "production"
      ? ["error", { allow: ["info", "warn", "error"] }]
      : "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ["ConditionalExpression"],
        ignoreComments: true,
      },
    ],
    quotes: [
      "warn",
      "double",
      {
        allowTemplateLiterals: true,
      },
    ],
  },
}
