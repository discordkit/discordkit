import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E config for the OAuth example. The web server runs with `DISCORD_E2E_MOCK`
 * set, which makes `instrumentation.ts` start MSW so the Next server's Discord
 * calls are intercepted — no real Discord account or network is involved (see
 * docs in instrumentation.ts / src/__mocks__). Env values are placeholders since
 * every Discord call is mocked; SESSION_SECRET just needs to be present.
 */
export default defineConfig({
  testDir: `./e2e`,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: `list`,
  use: {
    baseURL,
    trace: `on-first-retry`
  },
  projects: [{ name: `chromium`, use: { ...devices[`Desktop Chrome`] } }],
  webServer: {
    command: `next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DISCORD_E2E_MOCK: `1`,
      DISCORD_CLIENT_ID: `000000000000000000`,
      DISCORD_CLIENT_SECRET: `e2e-mock-secret`,
      DISCORD_REDIRECT_URI: `${baseURL}/api/auth/callback`,
      SESSION_SECRET: `e2e-session-secret-at-least-32-bytes-long-000`
    }
  }
});
