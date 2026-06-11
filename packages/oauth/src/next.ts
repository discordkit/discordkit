import { createAuthHandler, type AuthHandlerConfig } from "./handler.js";

export {
  createAuthHandler,
  parseCookies,
  appendCookie,
  type AuthHandler,
  type AuthHandlerConfig
} from "./handler.js";

/**
 * A Next.js App Router Route Handler. Next's handlers receive a Web-standard
 * `Request` and return a `Response`, so this type is structural — we never
 * import `next`, keeping the dependency graph small. Compatible with the
 * `GET`/`POST`/etc. exports a `route.ts` file provides.
 */
export type RouteHandler = (request: Request) => Promise<Response>;

/**
 * Next.js App Router handlers for the Discord authorization-code flow.
 *
 * Mount each on its own route segment. Because Next Route Handlers are just
 * Web-standard `(Request) => Response` functions, these are the
 * {@link createAuthHandler} handlers verbatim, exposed under the `GET` name
 * Next expects.
 *
 * @example
 * ```ts
 * // app/api/auth/login/route.ts
 * import { createDiscordAuth } from "@discordkit/oauth/next";
 * export const { login } = createDiscordAuth({
 *   clientId: process.env.DISCORD_CLIENT_ID!,
 *   clientSecret: process.env.DISCORD_CLIENT_SECRET!,
 *   redirectUri: process.env.DISCORD_REDIRECT_URI!,
 *   scopes: ["identify", "email"]
 * });
 * export const GET = login;
 * ```
 *
 * ```ts
 * // app/api/auth/callback/route.ts
 * import { auth } from "../shared";
 * export const GET = auth.callback;
 * ```
 */
export interface DiscordAuthRoutes {
  /** `GET` handler for the login route — redirects to Discord. */
  login: RouteHandler;
  /** `GET` handler for the callback route — exchanges the code. */
  callback: RouteHandler;
}

export const createDiscordAuth = (
  config: AuthHandlerConfig
): DiscordAuthRoutes => {
  const handler = createAuthHandler(config);
  return { login: handler.login, callback: handler.callback };
};
