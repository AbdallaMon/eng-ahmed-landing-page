import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // The /register 3D layer uses react-three-fiber, whose imperative API is
  // fundamentally at odds with a few React-19 react-compiler lint rules:
  // mutating three.js objects returned from useThree (immutability), running a
  // one-shot device-capability/scene-transition setState in an effect
  // (set-state-in-effect), and selecting a scene component dynamically from a
  // registry (static-components). These are correct R3F patterns, so we scope
  // those three rules off for the 3D folder ONLY — the rest of the repo stays
  // strict.
  {
    files: ["src/app/register/three/**/*.{js,jsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
