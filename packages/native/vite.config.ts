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
    deps: { skipNodeModulesBundle: true }
  }
});
