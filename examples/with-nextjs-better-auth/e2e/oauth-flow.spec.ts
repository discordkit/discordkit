import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import {
  MOCK_USERNAME,
  MOCK_GUILD_NAMES,
  MOCK_SCOPES
} from "@discordkit/e2e/oauth-fixtures";

/**
 * E2E for the Next.js + Better Auth example.
 *
 * This is the one example whose OAuth flow isn't driven by `@discordkit/oauth`,
 * so it can't reuse the shared `registerOAuthFlowTests` harness verbatim —
 * Better Auth owns the flow with its own endpoints (`/api/auth/sign-in/social`,
 * `/api/auth/callback/discord`), state, and cookies. But the *assertions* are
 * deliberately identical to the other examples: the dashboard shows the mocked
 * profile + guilds, refresh keeps it populated, logout clears the session, and
 * the protected route is inaccessible logged-out. Discord is mocked via MSW in
 * the Next server (see src/instrumentation.ts) — no real account involved.
 *
 * We can't drive Discord's real, CAPTCHA-gated authorize page, so we reproduce
 * what Discord does on success: initiate Better Auth's social sign-in to get
 * the authorize URL (which carries Better Auth's `state`, and sets its state
 * cookie in the shared jar), then hit Better Auth's callback directly with a
 * mock `code` + that `state`. MSW intercepts the server-side token exchange.
 */
const login = async (page: Page, context: BrowserContext): Promise<void> => {
  await page.goto(`/`);

  // Ask Better Auth to start the Discord flow. It returns the authorize URL and
  // sets its state cookie in the context's cookie jar (shared with page). The
  // `Origin` header is required (Better Auth's CSRF protection rejects the
  // social sign-in otherwise). The browser SDK adds it automatically; we add
  // the header explicitly here since we call the endpoint directly.
  const response = await context.request.post(`/api/auth/sign-in/social`, {
    headers: { origin: `http://localhost:3000` },
    data: { provider: `discord`, callbackURL: `/dashboard` }
  });
  const { url } = (await response.json()) as { url: string };
  const state = new URL(url).searchParams.get(`state`) ?? ``;

  // Stand in for Discord's post-consent redirect to Better Auth's callback.
  await page.goto(
    `/api/auth/callback/discord?code=e2e-test-code&state=${state}`
  );
};

test(`the dashboard is protected when logged out`, async ({ page }) => {
  await page.goto(`/dashboard`);
  await expect(
    page.getByRole(`button`, { name: `Login with Discord` })
  ).toBeVisible();
  await expect(page.getByText(MOCK_USERNAME)).toBeHidden();
});

test(`logs in, shows the mocked profile and guilds`, async ({
  page,
  context
}) => {
  await login(page, context);

  // Profile from /oauth2/@me (mocked), fetched via discordkit with the token
  // Better Auth stored.
  await expect(page.getByText(MOCK_USERNAME)).toBeVisible();
  await expect(
    page.getByText(`Scopes: ${MOCK_SCOPES.join(`, `)}`)
  ).toBeVisible();

  // Guilds from getCurrentUserGuilds via discord.asUser() (mocked).
  await expect(
    page.getByRole(`heading`, {
      name: `Your servers (${MOCK_GUILD_NAMES.length})`
    })
  ).toBeVisible();
  for (const name of MOCK_GUILD_NAMES) {
    await expect(page.getByText(name)).toBeVisible();
  }
});

test(`refresh keeps the dashboard populated`, async ({ page, context }) => {
  await login(page, context);
  await expect(page.getByText(MOCK_USERNAME)).toBeVisible();

  await page.getByRole(`button`, { name: `Refresh now` }).click();

  await expect(page.getByText(`Token refreshed`)).toBeVisible();
  await expect(
    page.getByRole(`heading`, {
      name: `Your servers (${MOCK_GUILD_NAMES.length})`
    })
  ).toBeVisible();
});

test(`logout clears the session and the dashboard becomes inaccessible`, async ({
  page,
  context
}) => {
  await login(page, context);
  await expect(page.getByText(MOCK_USERNAME)).toBeVisible();

  await page.getByRole(`button`, { name: `Log out` }).click();

  // Back to logged-out: the login button is shown and the profile is gone.
  await expect(
    page.getByRole(`button`, { name: `Login with Discord` })
  ).toBeVisible();
  await expect(page.getByText(MOCK_USERNAME)).toBeHidden();

  // The protected route is now inaccessible: /dashboard redirects to `/`.
  await page.goto(`/dashboard`);
  await expect(
    page.getByRole(`button`, { name: `Login with Discord` })
  ).toBeVisible();
  await expect(page.getByText(MOCK_USERNAME)).toBeHidden();
});
