/**
 * Web-standard cryptographic helpers for the OAuth2 flows. Everything here
 * runs on the Web Crypto API (`crypto.getRandomValues`, `crypto.subtle`) and
 * the `btoa` global, so it works unchanged on Node 18+, browsers, Cloudflare
 * Workers, Deno, and other edge runtimes. No Node `Buffer` / `node:crypto`.
 */

/** Resolve the platform `Crypto` instance, mirroring verifyKey's defensive lookup. */
const getCrypto = (): Crypto => {
  if (typeof globalThis.crypto !== `undefined`) {
    return globalThis.crypto;
  }
  throw new Error(`Web Crypto API is not available in this environment`);
};

/**
 * Base64url-encode bytes without padding (RFC 4648 §5). Uses `btoa` rather
 * than `Buffer` so it runs on edge runtimes.
 */
const base64UrlEncode = (bytes: Uint8Array): string => {
  // `String.fromCharCode(...bytes)` would overflow the call stack for large
  // inputs, but PKCE inputs are tiny (32–96 bytes), so a reduce is fine and
  // keeps the function pure / mutation-free at the call boundary.
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ``
  );
  return btoa(binary)
    .replace(/\+/g, `-`)
    .replace(/\//g, `_`)
    .replace(/=+$/, ``);
};

/** Generate `length` random bytes and return them base64url-encoded. */
const randomBase64Url = (length: number): string =>
  base64UrlEncode(getCrypto().getRandomValues(new Uint8Array(length)));

/**
 * Generate a cryptographically random `state` value for CSRF protection on
 * the authorization request. Store it (e.g. in a cookie) before redirecting
 * and compare it against the `state` query parameter on the callback.
 */
export const generateState = (): string => randomBase64Url(32);

/**
 * Generate a cryptographically random `nonce` value, used to mitigate replay
 * attacks when an OpenID-style `id_token` is involved. Distinct from
 * {@link generateState} only by intent.
 */
export const generateNonce = (): string => randomBase64Url(32);

/**
 * A PKCE (Proof Key for Code Exchange, RFC 7636) pair.
 *
 * - {@link codeVerifier} is the secret you persist (cookie / KV / session)
 *   between the authorization redirect and the token exchange.
 * - {@link codeChallenge} is sent on the authorization request.
 * - {@link codeChallengeMethod} is always `"S256"` — Discord supports the
 *   SHA-256 method, and `"plain"` is intentionally not offered.
 */
export interface PKCE {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: `S256`;
}

/**
 * Generate a PKCE verifier/challenge pair using the `S256` method.
 *
 * Async because deriving the challenge requires `crypto.subtle.digest`, which
 * has no synchronous Web Crypto equivalent.
 */
export const generatePKCE = async (): Promise<PKCE> => {
  // RFC 7636 §4.1: a verifier is 43–128 chars of unreserved characters. 32
  // random bytes base64url-encode to 43 chars — the minimum valid length.
  const codeVerifier = randomBase64Url(32);
  const digest = await getCrypto().subtle.digest(
    `SHA-256`,
    new TextEncoder().encode(codeVerifier)
  );
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(new Uint8Array(digest)),
    codeChallengeMethod: `S256`
  };
};
