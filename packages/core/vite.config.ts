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
    // Unbundled mode (see packages/client/vite.config.ts for rationale).
    entry: [
      `src/**/*.ts`,
      `!src/**/__mocks__/**`,
      `!src/**/__tests__/**`,
      `!src/**/*.spec.ts`
    ],
    unbundle: true,
    dts: true,
    // Keep every node_modules reference external. Without this, tsdown
    // inlines transitive type definitions (e.g. @trpc/server's deep
    // type imports) into `dist/node_modules/...`, which both bloats
    // the package and pulls third-party types under our publish surface.
    deps: { skipNodeModulesBundle: true }
  }
});
