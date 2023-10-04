import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  outExtension: ({ format }) => ({
    js: format === `cjs` ? `.cjs` : `.js`
  }),
  format: ["esm", "cjs"],
  tsconfig: "./tsconfig.build.json",
  dts: true,
  sourcemap: true,
  clean: true
}));
