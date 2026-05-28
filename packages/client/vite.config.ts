import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      build: { command: `vp pack`, cache: true },
      dev: { command: `vp pack --watch`, cache: false }
    }
  },
  test: {
    globals: true,
    environment: `happy-dom`
  },
  pack: {
    entry: `src/index.ts`,
    dts: true,
    deps: { neverBundle: [`@discordkit/core`] }
  }
});
