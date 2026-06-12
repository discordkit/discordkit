import { setupServer } from "msw/node";
import { handlers } from "@discordkit/e2e/oauth-handlers";

/**
 * The MSW server that intercepts the Next server's outbound Discord calls
 * during E2E — including Better Auth's internal token exchange and discordkit's
 * /oauth2/@me + guilds calls. The handlers are shared across all framework
 * examples (@discordkit/e2e). Started from `instrumentation.ts` only when
 * `DISCORD_E2E_MOCK` is set, so it never affects normal dev or production.
 */
export const server = setupServer(...handlers);
