import { defineConfig } from "@playwright/test";

/**
 * Local Electron smoke config. Runs `e2e/*.smoke.ts` via Playwright's Electron
 * launcher — no webServer/baseURL (the test launches the app itself).
 *
 * Prerequisites (maintainer-run, not CI): build the workspace packages and this
 * example's renderer first so Electron loads `dist/index.html` and the
 * `@discordkit/*` deps resolve to their built `dist/`:
 *
 *   vp run build              # @discordkit/native + @discordkit/electron
 *   vp run build:examples     # this example's renderer -> dist/
 *   DISCORD_APPLICATION_ID=… DISCORD_SDK_PATH=… vp run smoke
 */
export default defineConfig({
  testDir: `./e2e`,
  testMatch: `**/*.smoke.ts`,
  fullyParallel: false,
  workers: 1,
  reporter: `list`,
  timeout: 30_000
});
