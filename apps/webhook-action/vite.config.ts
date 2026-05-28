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
    deps: { alwaysBundle: [`@discordkit/client`] },
    minify: true,
    treeshake: true
  }
});
