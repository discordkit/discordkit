import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll
} from "vite-plus/test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createAuthHandler, parseCookies, appendCookie } from "../handler.js";
import { createStateCookie } from "../cookies.js";

const server = setupServer();

const config = {
  clientId: `123`,
  clientSecret: `secret`,
  redirectUri: `https://app.example.com/api/auth/callback`,
  scopes: [`identify` as const]
};

const TOKEN_URL = `https://discord.com/api/oauth2/token`;

/** Pull the cookie name=value pairs out of all Set-Cookie headers. */
const setCookies = (res: Response): string[] => res.headers.getSetCookie();

describe(`parseCookies`, () => {
  it(`parses a Cookie header into a decoded map`, () => {
    const request = new Request(`https://x.test`, {
      headers: { cookie: `a=1; b=hello%20world` }
    });
    expect(parseCookies(request)).toEqual({ a: `1`, b: `hello world` });
  });

  it(`returns an empty object when there is no Cookie header`, () => {
    expect(parseCookies(new Request(`https://x.test`))).toEqual({});
  });
});

describe(`appendCookie`, () => {
  it(`preserves existing Set-Cookie entries`, () => {
    // WHY: the flow sets two cookies (state + verifier); a naive `set` would
    // clobber the first. We rely on append semantics — guard against regression.
    const headers = new Headers();
    appendCookie(headers, createStateCookie(`one`));
    appendCookie(headers, createStateCookie(`two`, { name: `other` }));
    expect(headers.getSetCookie()).toHaveLength(2);
  });
});

describe(`createAuthHandler.login`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it(`302s to Discord and sets state + verifier cookies (PKCE on by default)`, async () => {
    const handler = createAuthHandler(config);
    const res = await handler.login(
      new Request(`https://app.example.com/api/auth/login`)
    );

    expect(res.status).toBe(302);
    const location = res.headers.get(`location`);
    expect(location).toContain(`https://discord.com/oauth2/authorize`);
    // WHY: PKCE default means the authorize URL must carry a challenge AND the
    // verifier must be stashed in a cookie for the callback to retrieve.
    const url = new URL(location ?? ``);
    expect(url.searchParams.get(`code_challenge_method`)).toBe(`S256`);
    expect(url.searchParams.get(`state`)?.length).toBeGreaterThan(0);

    const cookies = setCookies(res);
    expect(
      cookies.some((c) => c.startsWith(`__Host-discord_oauth_state=`))
    ).toBe(true);
    expect(
      cookies.some((c) => c.startsWith(`__Host-discord_oauth_verifier=`))
    ).toBe(true);
  });

  it(`omits the PKCE challenge and verifier cookie when usePKCE is false`, async () => {
    const handler = createAuthHandler({ ...config, usePKCE: false });
    const res = await handler.login(
      new Request(`https://app.example.com/api/auth/login`)
    );
    const url = new URL(res.headers.get(`location`) ?? ``);
    expect(url.searchParams.has(`code_challenge`)).toBe(false);
    expect(setCookies(res).some((c) => c.includes(`verifier`))).toBe(false);
  });
});

describe(`createAuthHandler.callback`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  /** Build a callback request carrying a state cookie and matching query state. */
  const callbackRequest = ({
    code,
    state,
    cookieState
  }: {
    code?: string;
    state?: string;
    cookieState?: string;
  }): Request => {
    const url = new URL(`https://app.example.com/api/auth/callback`);
    if (code !== undefined) url.searchParams.set(`code`, code);
    if (state !== undefined) url.searchParams.set(`state`, state);
    return new Request(url, {
      headers:
        cookieState === undefined
          ? {}
          : { cookie: `__Host-discord_oauth_state=${cookieState}` }
    });
  };

  it(`rejects a state mismatch as CSRF without calling the token endpoint`, async () => {
    // WHY: the state check is the flow's CSRF defense. If state doesn't match
    // the cookie we must refuse BEFORE exchanging — a mismatch means the
    // request may not have originated from our own login redirect.
    let tokenCalled = false;
    server.use(
      http.post(TOKEN_URL, () => {
        tokenCalled = true;
        return HttpResponse.json({});
      })
    );
    const handler = createAuthHandler({ ...config, usePKCE: false });
    const res = await handler.callback(
      callbackRequest({ code: `c`, state: `attacker`, cookieState: `legit` })
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain(`cross-site request forgery`);
    expect(tokenCalled).toBe(false);
  });

  it(`surfaces a user-denied authorization error`, async () => {
    const handler = createAuthHandler(config);
    const url = new URL(`https://app.example.com/api/auth/callback`);
    url.searchParams.set(`error`, `access_denied`);
    const res = await handler.callback(new Request(url));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain(`access_denied`);
  });

  it(`exchanges the code, clears flow cookies, and redirects on success`, async () => {
    server.use(
      http.post(TOKEN_URL, () =>
        HttpResponse.json({
          access_token: `t`,
          token_type: `Bearer`,
          expires_in: 604800,
          scope: `identify`
        })
      )
    );
    const handler = createAuthHandler({
      ...config,
      usePKCE: false,
      successRedirect: `/dashboard`
    });
    const res = await handler.callback(
      callbackRequest({ code: `good`, state: `s`, cookieState: `s` })
    );

    expect(res.status).toBe(302);
    expect(res.headers.get(`location`)).toBe(`/dashboard`);
    // WHY: the transient secrets must not outlive the flow — both are cleared
    // with Max-Age=0 so they can't be replayed.
    const cleared = setCookies(res);
    expect(
      cleared.some((c) => c.includes(`state=`) && c.includes(`Max-Age=0`))
    ).toBe(true);
  });

  it(`lets onSuccess take over the response while still clearing cookies`, async () => {
    server.use(
      http.post(TOKEN_URL, () =>
        HttpResponse.json({
          access_token: `t`,
          token_type: `Bearer`,
          expires_in: 604800,
          scope: `identify`
        })
      )
    );
    const handler = createAuthHandler({
      ...config,
      usePKCE: false,
      onSuccess: (tokens) =>
        // WHY: onSuccess is the consumer's session-persistence seam; returning
        // a Response must override the default redirect, yet our cookie
        // cleanup must still be merged in.
        new Response(JSON.stringify({ token: tokens.accessToken }), {
          status: 200,
          headers: { "Content-Type": `application/json` }
        })
    });
    const res = await handler.callback(
      callbackRequest({ code: `good`, state: `s`, cookieState: `s` })
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ token: `t` });
    expect(setCookies(res).some((c) => c.includes(`Max-Age=0`))).toBe(true);
  });
});
