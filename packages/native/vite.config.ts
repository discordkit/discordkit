import { defineConfig } from "vite-plus";
import { buildTarget } from "../../scripts/buildTarget.js";

export default defineConfig({
  run: {
    tasks: {
      build: { command: `vp pack`, cache: true },
      dev: { command: `vp pack --watch`, cache: false },
      // Real-SDK ABI smoke — needs the genuine binary (DISCORD_SDK_PATH), so it's
      // a separate task, not part of the fork-safe `vp test` unit suite. Run by
      // the `native` CI workflow after checking out the private SDK repo.
      smoke: {
        command: `vitest run src/__smoke__/real-sdk.smoke.ts`,
        cache: false
      }
    }
  },
  test: {
    globals: true,
    // The real-SDK smoke is opt-in (`vp run smoke`); never part of the default
    // unit suite (which runs on the mock backend, including on fork PRs).
    exclude: [`**/node_modules/**`, `**/dist/**`, `**/*.smoke.ts`]
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
