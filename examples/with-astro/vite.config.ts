import { defineConfig } from "vite-plus";
import { mergeLint, lint, fmt } from "@saeris/configs";

export default defineConfig({
  run: {
    tasks: {
      // Generate codegen the typecheck/build depend on: Varlock env types
      // (`env.d.ts`) and Astro's `.astro/types.d.ts` (via `astro sync`). Both
      // are gitignored, so CI runs this (vp run -r typegen) before vp check.
      typegen: {
        command: `varlock typegen && astro sync`,
        cache: false
      },
      dev: { command: `astro dev`, cache: false, dependsOn: [`typegen`] },
      "build:examples": {
        command: `astro build`,
        cache: true,
        dependsOn: [`typegen`]
      },
      preview: { command: `astro preview`, cache: false },
      // E2E: Playwright drives the running app; Discord is mocked via MSW
      // (src/middleware.ts under DISCORD_E2E_MOCK). The playwright config
      // starts the server itself with the test env.
      e2e: { command: `playwright test`, cache: false, dependsOn: [`typegen`] }
    }
  },
  lint: mergeLint(lint),
  fmt
});
