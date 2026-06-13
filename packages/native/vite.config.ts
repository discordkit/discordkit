import { defineConfig } from "vite-plus";
import { buildTarget } from "../../scripts/buildTarget.js";

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
    // Build target derived from the root package.json `engines.node` — a
    // single source of truth for the whole workspace.
    target: buildTarget,
    // Unbundled mode (see packages/core/vite.config.ts for rationale): each
    // src file maps 1:1 to a dist file so the `./*` subpath export resolves
    // (`@discordkit/native/presence` -> dist/presence.mjs) and consumers
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
