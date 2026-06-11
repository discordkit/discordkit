import { describe, it, expect } from "vite-plus/test";
import {
  createStateCookie,
  createCodeVerifierCookie,
  serializeCookie
} from "../cookies.js";

describe(`createStateCookie`, () => {
  it(`uses secure-by-default attributes`, () => {
    // WHY: these defaults are the security contract of the package. SameSite
    // must be `lax` (not `strict`) so the cookie survives Discord's top-level
    // redirect back to the callback; HttpOnly + Secure + __Host- prevent
    // client-side access and cross-origin leakage.
    const cookie = createStateCookie(`abc`);
    expect(cookie.name).toBe(`__Host-discord_oauth_state`);
    expect(cookie.value).toBe(`abc`);
    expect(cookie.attributes).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: `lax`,
      path: `/`,
      maxAge: 600
    });
  });

  it(`allows overriding name and attributes for local HTTP dev`, () => {
    // WHY: __Host- cookies require Secure, which browsers reject over plain
    // HTTP — local dev needs an escape hatch.
    const cookie = createStateCookie(`abc`, {
      name: `dev_state`,
      attributes: { secure: false }
    });
    expect(cookie.name).toBe(`dev_state`);
    expect(cookie.attributes.secure).toBe(false);
    // unrelated defaults are preserved through the merge
    expect(cookie.attributes.httpOnly).toBe(true);
  });
});

describe(`createCodeVerifierCookie`, () => {
  it(`uses a distinct default name from the state cookie`, () => {
    // WHY: state and verifier are separate secrets; sharing a name would clobber.
    expect(createCodeVerifierCookie(`v`).name).toBe(
      `__Host-discord_oauth_verifier`
    );
  });
});

describe(`serializeCookie`, () => {
  it(`renders a Set-Cookie header value with capitalized SameSite`, () => {
    // WHY: the generic Workers adapter has no cookie jar and writes the raw
    // header; SameSite must be the capitalized token the spec expects.
    const header = serializeCookie(createStateCookie(`abc`));
    expect(header).toBe(
      `__Host-discord_oauth_state=abc; Path=/; Max-Age=600; SameSite=Lax; HttpOnly; Secure`
    );
  });

  it(`drops HttpOnly and Secure flags when disabled`, () => {
    const header = serializeCookie(
      createStateCookie(`abc`, {
        attributes: { httpOnly: false, secure: false }
      })
    );
    expect(header).not.toContain(`HttpOnly`);
    expect(header).not.toContain(`Secure`);
  });
});
