import { defineConfig } from "vite-plus";
import { mergeLint, lint, react, next, fmt } from "@saeris/configs";

export default defineConfig({
  run: {
    tasks: {
      // Generate the Varlock env types (`env.d.ts`, gitignored) before dev or
      // build so TypeScript can resolve `ENV.*`. Mirrors how `next-env.d.ts` is
      // generated rather than committed.
      typegen: { command: `varlock typegen`, cache: false },
      dev: { command: `next dev`, cache: false, dependsOn: [`typegen`] },
      "build:examples": {
        command: `next build`,
        cache: true,
        dependsOn: [`typegen`]
      },
      start: { command: `next start`, cache: false },
      // E2E: Playwright drives the running app; Discord is mocked via MSW
      // (instrumentation.ts under DISCORD_E2E_MOCK). The playwright config
      // starts the dev server itself with the test env.
      e2e: { command: `playwright test`, cache: false, dependsOn: [`typegen`] }
    }
  },
  lint: mergeLint(lint, react, next),
  fmt
});
