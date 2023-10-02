import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/client/src/application/**/*.{test,spec}.?(c|m)[jt]s?(x)"
    ],
    name: `discordkit`,
    globals: true,
    watch: false,
    environment: `jsdom`,
    setupFiles: [`./scripts/setup.ts`]
  },
  resolve: {
    alias: {
      "test-utils": `./scripts/test-utils.ts`
    }
  }
});
