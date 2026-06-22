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
    target: buildTarget,
    // Unbundled: one dist file per source file so the `./*` subpath export
    // resolves (`@discordkit/tauri/sidecar` -> dist/sidecar.mjs) and the two
    // contexts (sidecar host / webview client) stay independently importable —
    // the tree-shaking boundary the package depends on.
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
