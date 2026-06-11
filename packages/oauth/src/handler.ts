import { createOAuth2, type OAuth2Config } from "./createOAuth2.js";
import type { TokenResponse } from "./types/TokenResponse.js";
import {
  createStateCookie,
  createCodeVerifierCookie,
  serializeCookie,
  type CookieDescriptor,
  type CookieOptions
} from "./cookies.js";
import { generateState, generatePKCE } from "./crypto.js";
import type { OAuth2Scope } from "./types/OAuth2Scope.js";

/**
 * Parse the `Cookie` header of a request into a name→value map. A pure helper
 * exposed for adapters and power users who want to read the transient flow
 * cookies (`state`, `code_verifier`) themselves.
 */
export const parseCookies = (
  request: Request
): Record<string, string | undefined> => {
  const header = request.headers.get(`cookie`);
  if (header === null || header.length === 0) {
    return {};
  }
  return Object.fromEntries(
    header.split(`;`).map((pair) => {
      const index = pair.indexOf(`=`);
      // A cookie with no `=` is malformed; treat the whole thing as the name.
      const name = (index === -1 ? pair : pair.slice(0, index)).trim();
      const value = index === -1 ? `` : pair.slice(index + 1).trim();
      return [name, decodeURIComponent(value)];
    })
  );
};

/**
 * Append a {@link CookieDescriptor} to a `Headers` object as a `Set-Cookie`
 * entry, preserving any existing `Set-Cookie` values. A pure helper exposed
 * for adapters and power users writing their own `Response`.
 */
export const appendCookie = (
  headers: Headers,
  descriptor: CookieDescriptor
): void => {
  headers.append(`Set-Cookie`, serializeCookie(descriptor));
};

/** Build a descriptor that clears a cookie (empty value, immediate expiry). */
const clearCookie = (descriptor: CookieDescriptor): CookieDescriptor => ({
  ...descriptor,
  value: ``,
  attributes: { ...descriptor.attributes, maxAge: 0 }
});

/** Configuration for {@link createAuthHandler}, extending the base OAuth2 config. */
export interface AuthHandlerConfig extends OAuth2Config {
  /** The scopes to request on the authorization redirect. */
  scopes: OAuth2Scope[];
  /**
   * Whether to use PKCE on the authorization-code flow. Defaults to `true` —
   * PKCE is the recommended protection for public/serverless clients and adds
   * no downside for confidential ones.
   */
  usePKCE?: boolean;
  /**
   * Where to send the user after a successful callback. Defaults to `/`.
   * The handler issues a 302 redirect here once tokens are obtained.
   */
  successRedirect?: string;
  /** Overrides for the transient `state` / `code_verifier` cookies. */
  cookieOptions?: CookieOptions;
  /**
   * Called with the obtained tokens (and the original request) after a
   * successful exchange, before the success redirect. Use it to persist the
   * session however you like (cookie, KV, DB). Return a `Response` to take
   * over the response entirely (e.g. to set your own session cookie); return
   * nothing to let the handler issue its default redirect.
   */
  onSuccess?: (
    tokens: TokenResponse,
    request: Request
  ) => Response | undefined | Promise<Response | undefined>;
}

/**
 * A pair of Web-standard request handlers implementing the authorization-code
 * flow. Both take a `Request` and return a `Response`, so they drop unchanged
 * into any server runtime that speaks the Fetch API — Next App Router Route
 * Handlers, Astro endpoints, Cloudflare Workers, Deno, Bun, etc. This package
 * never imports a framework; the `/next`, `/astro`, and `/web` subpaths only
 * re-shape these signatures.
 */
export interface AuthHandler {
  /** Start the flow: sets state/PKCE cookies and 302s to Discord's consent page. */
  login: (request: Request) => Promise<Response>;
  /** Finish the flow: verifies state, exchanges the code, clears cookies. */
  callback: (request: Request) => Promise<Response>;
}

/**
 * Create the Web-standard login + callback handlers for Discord's
 * authorization-code flow (with PKCE by default).
 *
 * @example Cloudflare Worker
 * ```ts
 * const auth = createAuthHandler({ clientId, clientSecret, redirectUri, scopes: ["identify"] });
 * export default {
 *   fetch(req: Request) {
 *     const { pathname } = new URL(req.url);
 *     if (pathname === "/api/auth/login") return auth.login(req);
 *     if (pathname === "/api/auth/callback") return auth.callback(req);
 *     return new Response("Not found", { status: 404 });
 *   }
 * };
 * ```
 */
export const createAuthHandler = (config: AuthHandlerConfig): AuthHandler => {
  const {
    scopes,
    usePKCE = true,
    successRedirect = `/`,
    cookieOptions,
    onSuccess,
    ...oauthConfig
  } = config;
  const discord = createOAuth2(oauthConfig);

  return {
    login: async () => {
      const state = generateState();
      const headers = new Headers();
      appendCookie(headers, createStateCookie(state, cookieOptions));

      const pkce = usePKCE ? await generatePKCE() : undefined;
      if (pkce !== undefined) {
        appendCookie(
          headers,
          createCodeVerifierCookie(pkce.codeVerifier, cookieOptions)
        );
      }

      const url = discord.createAuthorizationURL({
        scopes,
        state,
        ...(pkce === undefined ? {} : { codeChallenge: pkce.codeChallenge })
      });

      headers.set(`Location`, url.href);
      return new Response(null, { status: 302, headers });
    },

    callback: async (request) => {
      const requestUrl = new URL(request.url);
      const code = requestUrl.searchParams.get(`code`);
      const returnedState = requestUrl.searchParams.get(`state`);
      const cookies = parseCookies(request);

      const stateCookie = createStateCookie(``, cookieOptions);
      const verifierCookie = createCodeVerifierCookie(``, cookieOptions);

      // Discord can redirect back with an OAuth2 error (e.g. the user denied
      // consent) instead of a code — surface it rather than failing opaquely.
      const oauthError = requestUrl.searchParams.get(`error`);
      if (oauthError !== null) {
        const description =
          requestUrl.searchParams.get(`error_description`) ??
          `The user did not complete authorization.`;
        return new Response(
          `Discord returned an authorization error (${oauthError}): ${description} This usually means the user declined the prompt. To fix: send them back through the login route to try again.`,
          { status: 400 }
        );
      }

      if (code === null) {
        return new Response(
          `The callback was reached without an authorization code, so there's nothing to exchange. This usually means the user landed here directly instead of being redirected by Discord. To fix: start the flow at the login route.`,
          { status: 400 }
        );
      }

      // CSRF check: the state echoed back must match the one we stored. A
      // mismatch means the request didn't originate from our login redirect.
      if (
        returnedState === null ||
        returnedState !== cookies[stateCookie.name]
      ) {
        return new Response(
          `The OAuth2 state value didn't match, so this callback was rejected to protect you from a cross-site request forgery (CSRF) attack. This can also happen if the login cookie expired before you finished. To fix: start the flow again from the login route.`,
          { status: 400 }
        );
      }

      const codeVerifier = cookies[verifierCookie.name];
      const tokens = await discord.validateAuthorizationCode(
        code,
        usePKCE && codeVerifier !== undefined ? { codeVerifier } : {}
      );

      // Always clear the transient flow cookies on the way out.
      const headers = new Headers();
      appendCookie(headers, clearCookie(stateCookie));
      appendCookie(headers, clearCookie(verifierCookie));

      const handled = await onSuccess?.(tokens, request);
      if (handled !== undefined) {
        // Merge our cookie-clearing headers into the caller's response.
        headers.forEach((value, key) => handled.headers.append(key, value));
        return handled;
      }

      headers.set(`Location`, successRedirect);
      return new Response(null, { status: 302, headers });
    }
  };
};
