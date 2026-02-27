import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      // Base Node.js globals
      globals: {
        ...globals.node,
        // k6-specific globals
        __ENV: "readonly",
        __VU: "readonly",
        __ITER: "readonly",
        // Optional: other k6 globals you might use
        // console is already part of globals.node
      },
    },
    rules: {
      // You can add custom rules here if desired
      // Example: turn off the "no-console" rule for k6 scripts
      "no-console": "off",
    },
  },
]);