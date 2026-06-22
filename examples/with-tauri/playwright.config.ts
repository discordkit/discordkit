import { defineConfig } from "@playwright/test";

/**
 * Local Tauri smoke config — maintainer-run, NOT a CI gate. Unlike the Electron example (which Playwright launches via `_electron.launch`), there's no Playwright launcher for a Tauri shell, so these tests **attach over CDP** to an already-running app and drive its real WebView2 webview.
 *
 * Run it in two terminals:
 *
 *   vp run start:cdp      # terminal 1 — launches the app with CDP on :9222
 *   vp run smoke          # terminal 2 — attaches + drives the flows
 *
 * Prerequisites: the `.env` (DISCORD_APPLICATION_ID + DISCORD_SDK_PATH) so the sidecar can load the SDK, and the redirect `http://127.0.0.1/callback` registered for the browser-fallback flow. Some flows need a human (approve/decline the Discord prompt, quit/start Discord) — those are gated behind `DISCORD_INTERACTIVE=1` and print the action to take. The default run covers only the no-interaction flows.
 *
 * Serial + single worker: every test drives the one shared app instance.
 */
export default defineConfig({
  testDir: `./e2e`,
  testMatch: `**/*.smoke.ts`,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: `list`,
  // Interactive flows wait on a human; give them room. Automated flows resolve fast.
  timeout: 180_000
});
