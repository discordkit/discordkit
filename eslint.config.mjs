import { defineConfig, globalIgnores } from "eslint/config";
import {
  base,
  next,
  stylistic,
  typeAware,
  vitest
} from "@saeris/eslint-config";

export default defineConfig([
  globalIgnores([`.yarn/**/*`], `Ignore Yarn Dirctory`),
  globalIgnores([`coverage/**/*`], `Ignore Coverage Directory`),
  globalIgnores([`**/.next/**/*`], `Ignore Nextjs Directories`),
  globalIgnores([`**/dist/**/*`], `Ignore Output Directories`),
  base,
  {
    name: `nextjs-only`,
    extends: [next],
    files: [`examples/with-nextjs/src/**/*.{j,t}s?(x)`]
  },
  stylistic,
  {
    name: `monorepo-typeaware`,
    extends: [typeAware],
    languageOptions: {
      parserOptions: {
        project: [
          `./tsconfig.json`,
          `./{apps,examples,packages}/**/.tsconfig.json`
        ],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  vitest,
  {
    name: `overrides`,
    rules: {
      "@stylistic/multiline-ternary": `off`,
      "@stylistic/object-property-newline": `off`
    }
  }
]);
