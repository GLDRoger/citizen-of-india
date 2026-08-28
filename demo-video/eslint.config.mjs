import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
        localStorage: "readonly",
        performance: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        window: "readonly",
      },
    },
  },
];
