import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { MOCK_USERNAME, MOCK_GUILD_NAMES, MOCK_SCOPES } from "./fixtures";

/**
 * The framework-agnostic Discord OAuth2 example E2E flow, shared across every
 * example app. Each example's `*.spec.ts` calls {@link registerOAuthFlowTests}
 * under its own `playwright.config.ts` (which boots that example's server with
 * Discord mocked via MSW — see the example's instrumentation).
 *
 * The Next *server's* Discord calls (token exchange, /oauth2/@me, guilds) are
 * intercepted by MSW in the example's server runtime. The one Discord call the
 * *browser* makes — the redirect to /oauth2/authorize — is intercepted here
 * and bounced straight back to the callback, standing in for the user logging
 * in + consenting. No real Discord account is involved.
 *
 * Assertions target user-visible outcomes (the testing skill's "don't assert
 * on requests"); the OAuth payload is validated inside the MSW handlers, which
 * 400 on a malformed exchange so these UI assertions fail naturally. Because it
 * drives only the shared UI + Discord API surface, the same flow works for the
 * Next, Astro, and Workers examples unchanged.
 */

/**
 * Complete the OAuth2 login without touching the real Discord login page.
 *
 * We can't let the browser follow the app's redirect to
 * `https://discord.com/oauth2/authorize` — that's Discord's real, CAPTCHA-gated
 * login, and `page.route` can't reliably intercept a cross-origin top-level
 * navigation. Instead we reproduce exactly what Discord does on a successful
 * authorization: take the `state` the app generated and hit the app's callback
 * directly with a code.
 *
 * The request to `/api/auth/login` sets the CSRF `state` + PKCE verifier
 * cookies in the browser context's cookie jar (shared between
 * `context.request` and `page`), so when the page then loads the callback, the
 * server validates state, exchanges the code (intercepted by MSW), and renders
 * the dashboard — same as a real login, minus the human at Discord.
 */
const login = async (page: Page, context: BrowserContext): Promise<void> => {
  await page.goto(`/`);

  // Start the flow: capture the state from the redirect to Discord (and let
  // the state/verifier cookies land in the shared jar) without following it.
  const response = await context.request.get(`/api/auth/login`, {
    maxRedirects: 0
  });
  const location = response.headers()[`location`];
  const state = new URL(location).searchParams.get(`state`) ?? ``;

  // Stand in for Discord's post-consent redirect back to the app.
  await page.goto(`/api/auth/callback?code=e2e-test-code&state=${state}`);
};

/**
 * Register the shared OAuth2 flow tests. Call this from an example's spec file.
 *
 * @example
 * ```ts
 * // examples/with-nextjs/e2e/oauth.spec.ts
 * import { registerOAuthFlowTests } from "@discordkit/e2e/oauth-e2e";
 * registerOAuthFlowTests();
 * ```
 */
export const registerOAuthFlowTests = (): void => {
  test(`the dashboard is protected when logged out`, async ({ page }) => {
    // Visiting the protected route without a session must redirect to the
    // public landing (the middleware guard), not render the dashboard.
    await page.goto(`/dashboard`);
    await expect(
      page.getByRole(`link`, { name: `Login with Discord` })
    ).toBeVisible();
    await expect(page.getByText(MOCK_USERNAME)).toBeHidden();
  });

  test(`logs in, shows the mocked profile and guilds`, async ({
    page,
    context
  }) => {
    await login(page, context);

    // Profile from /oauth2/@me (mocked).
    await expect(page.getByText(MOCK_USERNAME)).toBeVisible();
    await expect(
      page.getByText(`Scopes: ${MOCK_SCOPES.join(`, `)}`)
    ).toBeVisible();

    // Guilds from getCurrentUserGuilds via discord.asUser() (mocked) — the
    // count and names prove the user's bearer token reached the (mock) Discord.
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
    // Data still present after the refresh + re-fetch.
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

    // Back to logged-out: the login link is shown and the profile is gone.
    await expect(
      page.getByRole(`link`, { name: `Login with Discord` })
    ).toBeVisible();
    await expect(page.getByText(MOCK_USERNAME)).toBeHidden();

    // The protected route must now be inaccessible: visiting /dashboard after
    // logout redirects back to the public landing (proves the route guard AND
    // that the __Host- session cookie was actually cleared — the regression we
    // fixed, where a lingering cookie kept the user "logged in").
    await page.goto(`/dashboard`);
    await expect(
      page.getByRole(`link`, { name: `Login with Discord` })
    ).toBeVisible();
    await expect(page.getByText(MOCK_USERNAME)).toBeHidden();
  });
};
