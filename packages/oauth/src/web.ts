import { createAuthHandler, type AuthHandlerConfig } from "./handler.js";

export {
  createAuthHandler,
  parseCookies,
  appendCookie,
  type AuthHandler,
  type AuthHandlerConfig
} from "./handler.js";

/** Path configuration for {@link createAuthRouter}. */
export interface AuthRouterPaths {
  /** Pathname that starts the flow. Defaults to `/api/auth/login`. */
  login?: string;
  /** Pathname Discord redirects back to. Defaults to `/api/auth/callback`. */
  callback?: string;
}

/**
 * A single `fetch`-style handler that routes the login and callback paths to
 * {@link createAuthHandler}, for runtimes with one entry point (Cloudflare
 * Workers, Deno, Bun). Returns `undefined` for unmatched paths so the caller
 * can compose it with their own routing.
 *
 * @example
 * ```ts
 * const auth = createAuthRouter({ clientId, clientSecret, redirectUri, scopes: ["identify"] });
 * export default {
 *   async fetch(req: Request) {
 *     return (await auth(req)) ?? new Response("Not found", { status: 404 });
 *   }
 * };
 * ```
 */
export const createAuthRouter = (
  config: AuthHandlerConfig & { paths?: AuthRouterPaths }
): ((request: Request) => Promise<Response | undefined>) => {
  const { paths, ...handlerConfig } = config;
  const loginPath = paths?.login ?? `/api/auth/login`;
  const callbackPath = paths?.callback ?? `/api/auth/callback`;
  const handler = createAuthHandler(handlerConfig);

  return async (request) => {
    const { pathname } = new URL(request.url);
    if (pathname === loginPath) {
      return handler.login(request);
    }
    if (pathname === callbackPath) {
      return handler.callback(request);
    }
    return undefined;
  };
};
