import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: `discordkit`,
    globals: true,
    watch: false,
    environment: `happy-dom`,
    coverage: {
      provider: `v8`
    }
  },
  resolve: {
    alias: {
      "mock-utils": `./scripts/mock-utils.ts`,
      "test-utils": `./scripts/test-utils.ts`
    }
  }
});
