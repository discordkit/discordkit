import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      "build:apps": { command: `vp pack`, cache: true }
    }
  },
  pack: {
    entry: `src/index.ts`,
    format: `esm`,
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
      alwaysBundle: [`@discordkit/client`]
    },
    minify: true,
    treeshake: true
  }
});
