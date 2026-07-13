import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", ".firebase/**", "backend/data/*.sqlite3", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "tests/**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["scripts/**/*.mjs", "vite.config.js"],
    languageOptions: { globals: globals.node },
  },
];
