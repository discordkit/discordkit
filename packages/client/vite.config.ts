import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      build: { command: `vp pack`, cache: true },
      dev: { command: `vp pack --watch`, cache: false }
    }
  },
  test: {
    globals: true
  },
  pack: {
    // Entry needs to be a glob covering every source file so unbundle
    // emits a 1:1 mirror of src/ in dist/. A single `src/index.ts`
    // entry combined with `unbundle` would still emit the transitive
    // import graph, but downstream consumers would lose access to
    // sibling files via deep imports.
    entry: [
      `src/**/*.ts`,
      `!src/**/__mocks__/**`,
      `!src/**/__tests__/**`,
      `!src/**/*.spec.ts`
    ],
    // Unbundled mode: every source file is emitted as its own dist
    // file, preserving directory structure. Mirrors the pre-Vite+
    // tsup/tsc layout that v3.x consumers depend on.
    unbundle: true,
    dts: true,
    // Keep every node_modules reference external. Without this, tsdown
    // inlines transitive type definitions into `dist/node_modules/...`,
    // which bloats the package and pulls third-party types under our
    // publish surface. Workspace packages like `@discordkit/core` are
    // resolved to symlinks under node_modules so the same rule keeps
    // them as imports.
    deps: { skipNodeModulesBundle: true }
  }
});
