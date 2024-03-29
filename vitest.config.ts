import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: `discordkit`,
    globals: true,
    watch: false,
    environment: `happy-dom`,
    setupFiles: `./scripts/setup.ts`
  },
  resolve: {
    alias: {
      "test-utils": `./scripts/test-utils.ts`
    }
  }
});
