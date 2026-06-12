import type { HandlerInterceptor } from "waku/router/server";

/**
 * E2E mock bootstrap. A handler interceptor wraps every request (Waku's
 * cross-cutting hook), so it's the place to start MSW once — when
 * `DISCORD_E2E_MOCK` is set — to intercept the server's outbound Discord calls
 * (token exchange, /oauth2/@me, guilds). Normal dev/prod are untouched: without
 * the flag this just calls through.
 *
 * The handlers are shared across every framework example (@discordkit/e2e).
 * Route protection lives in the dashboard page (unstable_redirect), not here.
 */
let mswStarted = false;

const interceptor: HandlerInterceptor = async (next) => {
  if (!mswStarted && process.env.DISCORD_E2E_MOCK === `1`) {
    mswStarted = true;
    const { setupServer } = await import(`msw/node`);
    const { handlers } = await import(`@discordkit/e2e/oauth-handlers`);
    setupServer(...handlers).listen({ onUnhandledRequest: `bypass` });
  }
  return next();
};

export default interceptor;
