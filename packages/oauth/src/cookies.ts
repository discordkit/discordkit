/**
 * Cookie *descriptors* for the OAuth2 flow's transient secrets (the CSRF
 * `state` and the PKCE `code_verifier`). This module deliberately performs no
 * I/O: it returns plain descriptions of what cookies should be set, and the
 * framework adapter is responsible for writing them onto the response and
 * reading them off the request. That keeps the core utilities free of any
 * `next/headers` / `Astro.cookies` / Workers coupling.
 *
 * Defaults follow OAuth2 cookie best practice: the `__Host-` prefix (which
 * forces `Secure`, `Path=/`, and no `Domain`), `HttpOnly`, and
 * `SameSite=Lax` (Lax, not Strict, so the cookie survives the top-level
 * redirect back from Discord on the callback).
 */

/** A description of a cookie to set. Adapters translate this to their cookie API. */
export interface CookieDescriptor {
  name: string;
  value: string;
  attributes: CookieAttributes;
}

/** Standard cookie attributes. Mirrors the Web `CookieListItem`-ish shape. */
export interface CookieAttributes {
  httpOnly: boolean;
  secure: boolean;
  sameSite: `lax` | `strict` | `none`;
  path: string;
  /** Lifetime in seconds. */
  maxAge: number;
}

/** Overrides for {@link createStateCookie} / {@link createCodeVerifierCookie}. */
export interface CookieOptions {
  /**
   * Cookie name. Defaults use the `__Host-` prefix, which the browser only
   * honors when the cookie is `Secure`, `Path=/`, and has no `Domain`. If you
   * terminate TLS upstream and serve the app over plain HTTP locally, override
   * `name` to drop the prefix in development.
   */
  name?: string;
  /** Lifetime in seconds. Defaults to 600 (10 minutes) — these are transient. */
  maxAge?: number;
  /** Override individual attributes; merged over the secure defaults. */
  attributes?: Partial<CookieAttributes>;
}

const defaultAttributes = (maxAge: number): CookieAttributes => ({
  httpOnly: true,
  secure: true,
  sameSite: `lax`,
  path: `/`,
  maxAge
});

const createCookie = (
  defaultName: string,
  value: string,
  options?: CookieOptions
): CookieDescriptor => {
  const maxAge = options?.maxAge ?? 600;
  return {
    name: options?.name ?? defaultName,
    value,
    attributes: { ...defaultAttributes(maxAge), ...options?.attributes }
  };
};

/** Build the descriptor for the CSRF `state` cookie. */
export const createStateCookie = (
  state: string,
  options?: CookieOptions
): CookieDescriptor =>
  createCookie(`__Host-discord_oauth_state`, state, options);

/** Build the descriptor for the PKCE `code_verifier` cookie. */
export const createCodeVerifierCookie = (
  codeVerifier: string,
  options?: CookieOptions
): CookieDescriptor =>
  createCookie(`__Host-discord_oauth_verifier`, codeVerifier, options);

/**
 * Serialize a {@link CookieDescriptor} to a `Set-Cookie` header value. Useful
 * for the generic `Request`/`Response` (Workers) adapter, where there is no
 * framework cookie jar — Next and Astro adapters use their native cookie APIs
 * and the descriptor's fields directly instead.
 */
export const serializeCookie = ({
  name,
  value,
  attributes
}: CookieDescriptor): string =>
  [
    `${name}=${value}`,
    `Path=${attributes.path}`,
    `Max-Age=${attributes.maxAge}`,
    `SameSite=${attributes.sameSite.charAt(0).toUpperCase()}${attributes.sameSite.slice(1)}`,
    ...(attributes.httpOnly ? [`HttpOnly`] : []),
    ...(attributes.secure ? [`Secure`] : [])
  ].join(`; `);
