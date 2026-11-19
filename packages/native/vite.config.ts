import { defineConfig } from "vite-plus";
import { buildTarget } from "../../scripts/buildTarget.js";

export default defineConfig({
  run: {
    tasks: {
      build: { command: `vp pack`, cache: true },
      dev: { command: `vp pack --watch`, cache: false },
      // Real-SDK ABI smoke — runs only the `real-sdk` Vitest project (the genuine
      // binary, via DISCORD_SDK_PATH). The `native` CI workflow invokes this after
      // checking out the private SDK repo. The smoke skips itself when no binary
      // is present, so it's harmless in the default run too.
      smoke: {
        command: `vp test run --project real-sdk`,
        cache: false
      }
    }
  },
  test: {
    // Vitest v4 compatibility: keep separate Vite servers for inline projects.
    // Remove when plugins and config hooks can run once for shared projects.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#inline-projects-share-the-vite-server-by-default
    sharedViteServer: false,
    globals: true,
    // Two Vitest projects: the mock-backend `unit` suite (the fork-safe default)
    // and the `real-sdk` ABI smoke (opt-in via `vp run smoke` / `--project`).
    projects: [
      {
        extends: true,
        test: { name: `unit`, include: [`src/**/*.spec.ts`] }
      },
      {
        extends: true,
        test: { name: `real-sdk`, include: [`src/__smoke__/*.smoke.ts`] }
      }
    ]
  },
  pack: {
    // Build target derived from the root package.json `engines.node` — a
    // single source of truth for the whole workspace.
    target: buildTarget,
    // Unbundled mode (see packages/core/vite.config.ts for rationale): each
    // src file maps 1:1 to a dist file so subpath exports resolve
    // (`@discordkit/native/presence` -> dist/presence/index.mjs) and consumers
    // tree-shake at the file boundary.
    entry: [
      `src/**/*.ts`,
      `!src/**/__mocks__/**`,
      `!src/**/__tests__/**`,
      `!src/**/*.spec.ts`
    ],
    unbundle: true,
    dts: true,
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
      neverBundle: true
    }
  }
});
