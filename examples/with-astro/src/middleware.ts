import { defineMiddleware } from "astro:middleware";
import { getValidSession } from "#src/lib/auth";
import { hasUsableSession } from "#src/lib/session";

/**
 * Astro middleware, doing two jobs:
 *
 * 1. **E2E mock bootstrap** — Astro has no `instrumentation.ts`, so this is
 *    where MSW starts (once, when `DISCORD_E2E_MOCK` is set) to intercept the
 *    server's outbound Discord calls. Normal dev/prod are untouched.
 *
 * 2. **Route guard** — protects `/dashboard`: unauthenticated visitors are
 *    redirected to the public landing page. Centralizing the check here keeps
 *    the protection boundary in one place.
 */
let mswStarted = false;

export const onRequest = defineMiddleware(async (context, next) => {
  if (!mswStarted && process.env.DISCORD_E2E_MOCK === `1`) {
    mswStarted = true;
    const { setupServer } = await import(`msw/node`);
    const { handlers } = await import(`@discordkit/e2e/oauth-handlers`);
    setupServer(...handlers).listen({ onUnhandledRequest: `bypass` });
  }

  if (context.url.pathname === `/dashboard`) {
    const session = await getValidSession(context.cookies);
    if (!hasUsableSession(session)) {
      return context.redirect(`/`);
    }
  }

  return next();
});
