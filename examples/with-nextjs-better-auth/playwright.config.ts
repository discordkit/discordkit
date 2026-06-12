import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E config for the Next.js + Better Auth example. The web server runs with
 * `DISCORD_E2E_MOCK` set, which makes `instrumentation.ts` start MSW so the
 * server's outbound Discord calls — including Better Auth's own token exchange
 * and discordkit's /oauth2/@me + guilds — are intercepted. Env values are
 * placeholders since every Discord call is mocked.
 *
 * Unlike the @discordkit/oauth examples, this one can't use the shared
 * `registerOAuthFlowTests` harness verbatim: Better Auth owns the OAuth flow
 * with its own routes (/api/auth/callback/discord), cookies, and state. So the
 * spec lives here, but asserts the same user-visible outcomes.
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
      DISCORD_CLIENT_SECRET: `e2e-mock-secret-not-a-real-value-000`,
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET: `e2e-better-auth-secret-at-least-32-bytes-000`
    }
  }
});
