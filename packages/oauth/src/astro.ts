import { createAuthHandler, type AuthHandlerConfig } from "./handler.js";

export {
  createAuthHandler,
  parseCookies,
  appendCookie,
  type AuthHandler,
  type AuthHandlerConfig
} from "./handler.js";

/**
 * The subset of Astro's `APIContext` these handlers use. Typed structurally so
 * this package never imports `astro`. Astro's real `APIRoute` is assignable to
 * this signature.
 */
export interface APIContext {
  request: Request;
}

/** An Astro API route handler shape. */
export type APIRoute = (context: APIContext) => Promise<Response>;

/**
 * Astro endpoint handlers for the Discord authorization-code flow.
 *
 * Astro passes an `APIContext` (which carries the Web-standard `request`)
 * rather than the `Request` directly, so these unwrap `context.request` before
 * delegating to the shared {@link createAuthHandler}.
 *
 * @example
 * ```ts
 * // src/pages/api/auth/login.ts
 * import { createDiscordAuth } from "@discordkit/oauth/astro";
 * const auth = createDiscordAuth({
 *   clientId: import.meta.env.DISCORD_CLIENT_ID,
 *   clientSecret: import.meta.env.DISCORD_CLIENT_SECRET,
 *   redirectUri: import.meta.env.DISCORD_REDIRECT_URI,
 *   scopes: ["identify", "email"]
 * });
 * export const GET = auth.login;
 * ```
 */
export interface DiscordAuthRoutes {
  /** `GET` handler for the login endpoint — redirects to Discord. */
  login: APIRoute;
  /** `GET` handler for the callback endpoint — exchanges the code. */
  callback: APIRoute;
}

export const createDiscordAuth = (
  config: AuthHandlerConfig
): DiscordAuthRoutes => {
  const handler = createAuthHandler(config);
  return {
    login: async ({ request }) => handler.login(request),
    callback: async ({ request }) => handler.callback(request)
  };
};
