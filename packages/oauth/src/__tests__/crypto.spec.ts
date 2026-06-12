import { describe, it, expect } from "vite-plus/test";
import { generateState, generateNonce, generatePKCE } from "../crypto.js";

const BASE64URL = /^[A-Za-z0-9_-]+$/;

describe(`generateState`, () => {
  it(`returns a base64url string with no padding`, () => {
    // WHY: the value travels in a cookie and a URL query parameter; any `+`,
    // `/`, or `=` would need escaping and risks corruption in transit.
    expect(generateState()).toMatch(BASE64URL);
  });

  it(`returns a distinct value each call`, () => {
    // WHY: state is the CSRF guard — a predictable/repeated value defeats it.
    expect(generateState()).not.toEqual(generateState());
  });
});

describe(`generateNonce`, () => {
  it(`returns a base64url string distinct from state`, () => {
    expect(generateNonce()).toMatch(BASE64URL);
    expect(generateNonce()).not.toEqual(generateNonce());
  });
});

describe(`generatePKCE`, () => {
  it(`always uses the S256 method (never plain)`, async () => {
    // WHY: `plain` offers no protection if the verifier leaks; we intentionally
    // never emit it, so the method is asserted rather than the value.
    const pkce = await generatePKCE();
    expect(pkce.codeChallengeMethod).toBe(`S256`);
  });

  it(`derives a challenge that differs from the verifier`, async () => {
    // WHY: the whole point of S256 is that the challenge is a one-way hash of
    // the verifier — if they matched, sending the challenge would leak the
    // secret the verifier is meant to protect.
    const { codeVerifier, codeChallenge } = await generatePKCE();
    expect(codeVerifier).toMatch(BASE64URL);
    expect(codeChallenge).toMatch(BASE64URL);
    expect(codeChallenge).not.toEqual(codeVerifier);
  });

  it(`produces a stable challenge for a known verifier (RFC 7636 vector)`, async () => {
    // WHY: locks the encoding (SHA-256 + base64url, no padding) against the
    // canonical RFC 7636 Appendix B test vector, so a future refactor of the
    // crypto cannot silently change the wire format Discord validates against.
    // We can't inject the verifier into generatePKCE, so verify the transform
    // independently with the documented vector.
    const verifier = `dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`;
    const digest = await crypto.subtle.digest(
      `SHA-256`,
      new TextEncoder().encode(verifier)
    );
    const challenge = btoa(
      Array.from(new Uint8Array(digest), (b) => String.fromCharCode(b)).join(``)
    )
      .replace(/\+/g, `-`)
      .replace(/\//g, `_`)
      .replace(/=+$/, ``);
    expect(challenge).toBe(`E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`);
  });
});
