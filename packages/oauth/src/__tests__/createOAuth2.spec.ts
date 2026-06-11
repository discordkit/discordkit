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
import { createOAuth2 } from "../createOAuth2.js";

const server = setupServer();

const config = {
  clientId: `123456789`,
  clientSecret: `super-secret`,
  redirectUri: `https://app.example.com/api/auth/callback`
};

const TOKEN_URL = `https://discord.com/api/oauth2/token`;
const REVOKE_URL = `https://discord.com/api/oauth2/token/revoke`;

const rawToken = {
  access_token: `access`,
  token_type: `Bearer`,
  expires_in: 604800,
  refresh_token: `refresh`,
  scope: `identify email`
};

describe(`createOAuth2`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe(`createAuthorizationURL`, () => {
    const discord = createOAuth2(config);

    it(`builds the authorize URL with required params`, () => {
      const url = discord.createAuthorizationURL({
        scopes: [`identify`, `email`]
      });
      expect(url.origin + url.pathname).toBe(
        `https://discord.com/oauth2/authorize`
      );
      expect(url.searchParams.get(`client_id`)).toBe(config.clientId);
      expect(url.searchParams.get(`response_type`)).toBe(`code`);
      expect(url.searchParams.get(`redirect_uri`)).toBe(config.redirectUri);
      // WHY: Discord expects scopes space-delimited in a single param, not repeated.
      expect(url.searchParams.get(`scope`)).toBe(`identify email`);
    });

    it(`emits S256 method whenever a code challenge is supplied`, () => {
      // WHY: a challenge without its method param is silently treated as `plain`
      // by some servers — pairing them guarantees the PKCE binding we intend.
      const url = discord.createAuthorizationURL({
        scopes: [`identify`],
        codeChallenge: `abc`
      });
      expect(url.searchParams.get(`code_challenge`)).toBe(`abc`);
      expect(url.searchParams.get(`code_challenge_method`)).toBe(`S256`);
    });

    it(`omits optional params when not provided`, () => {
      const url = discord.createAuthorizationURL({ scopes: [`identify`] });
      expect(url.searchParams.has(`state`)).toBe(false);
      expect(url.searchParams.has(`code_challenge`)).toBe(false);
      expect(url.searchParams.has(`permissions`)).toBe(false);
    });

    it(`throws if redirectUri is missing`, () => {
      const noRedirect = createOAuth2({ clientId: `x` });
      expect(() =>
        noRedirect.createAuthorizationURL({ scopes: [`bot`] })
      ).toThrow(/redirectUri/);
    });
  });

  describe(`validateAuthorizationCode`, () => {
    const discord = createOAuth2(config);

    it(`exchanges a code and normalizes the response to camelCase`, async () => {
      let sentBody = ``;
      let sentAuth: string | null = null;
      server.use(
        http.post(TOKEN_URL, async ({ request }) => {
          sentAuth = request.headers.get(`authorization`);
          expect(request.headers.get(`content-type`)).toContain(
            `application/x-www-form-urlencoded`
          );
          sentBody = await request.text();
          return HttpResponse.json(rawToken);
        })
      );

      const tokens = await discord.validateAuthorizationCode(`the-code`, {
        codeVerifier: `the-verifier`
      });

      // WHY: the public surface is camelCase + a split scope array, decoupled
      // from Discord's snake_case wire shape.
      expect(tokens).toStrictEqual({
        accessToken: `access`,
        tokenType: `Bearer`,
        expiresIn: 604800,
        refreshToken: `refresh`,
        scope: [`identify`, `email`]
      });

      const body = new URLSearchParams(sentBody);
      expect(body.get(`grant_type`)).toBe(`authorization_code`);
      expect(body.get(`code`)).toBe(`the-code`);
      expect(body.get(`code_verifier`)).toBe(`the-verifier`);
      // WHY: Discord requires HTTP Basic (client_id:client_secret) on the token
      // endpoint — a missing/incorrect header is the most common 401 cause.
      expect(sentAuth).toBe(`Basic ${btoa(`123456789:super-secret`)}`);
    });

    it(`surfaces Discord's error code, description, and an actionable hint`, async () => {
      // WHY: a good error tells the caller what failed, why, and what to do —
      // not just a status code. We assert all three layers are present so a
      // future refactor can't quietly regress the message to a bare status.
      server.use(
        http.post(TOKEN_URL, () =>
          HttpResponse.json(
            {
              error: `invalid_grant`,
              error_description: `Invalid "code" in request.`
            },
            { status: 400 }
          )
        )
      );
      const error = await discord
        .validateAuthorizationCode(`bad`)
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(Error);
      const { message } = error as Error;
      expect(message).toContain(`HTTP 400`); // what
      expect(message).toContain(`invalid_grant`); // which error
      expect(message).toContain(`Invalid "code" in request.`); // why (Discord's words)
      expect(message).toContain(`single-use`); // how to fix (our hint)
    });

    it(`still produces a useful message when the error body isn't JSON`, async () => {
      // WHY: not every failure is a clean RFC 6749 body (gateways, 5xx HTML);
      // the message must degrade gracefully rather than crash on JSON.parse.
      server.use(
        http.post(TOKEN_URL, () =>
          HttpResponse.text(`<html>502 Bad Gateway</html>`, { status: 502 })
        )
      );
      await expect(discord.validateAuthorizationCode(`x`)).rejects.toThrow(
        /HTTP 502/
      );
    });
  });

  describe(`refreshAccessToken`, () => {
    it(`sends the refresh_token grant`, async () => {
      let body = ``;
      server.use(
        http.post(TOKEN_URL, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json(rawToken);
        })
      );
      await createOAuth2(config).refreshAccessToken(`old-refresh`);
      const params = new URLSearchParams(body);
      expect(params.get(`grant_type`)).toBe(`refresh_token`);
      expect(params.get(`refresh_token`)).toBe(`old-refresh`);
    });
  });

  describe(`clientCredentialsGrant`, () => {
    it(`omits refreshToken from the result (Discord issues none for this grant)`, async () => {
      server.use(
        http.post(TOKEN_URL, () =>
          // WHY: the client-credentials response has no refresh_token; the
          // normalized result must not invent one.
          HttpResponse.json({
            access_token: `app-token`,
            token_type: `Bearer`,
            expires_in: 604800,
            scope: `identify connections`
          })
        )
      );
      const tokens = await createOAuth2(config).clientCredentialsGrant([
        `identify`,
        `connections`
      ]);
      expect(tokens.refreshToken).toBeUndefined();
      expect(tokens).not.toHaveProperty(`refreshToken`);
    });
  });

  describe(`revokeToken`, () => {
    it(`posts the token to the revoke endpoint and resolves void`, async () => {
      let body = ``;
      server.use(
        http.post(REVOKE_URL, async ({ request }) => {
          body = await request.text();
          return new HttpResponse(null, { status: 200 });
        })
      );
      await expect(
        createOAuth2(config).revokeToken(`some-token`)
      ).resolves.toBeUndefined();
      expect(new URLSearchParams(body).get(`token`)).toBe(`some-token`);
    });
  });

  describe(`missing clientSecret`, () => {
    it(`throws before any network call when a token-endpoint method is used`, async () => {
      // WHY: a clear error beats an opaque Discord 401 — surface the config gap.
      const discord = createOAuth2({ ...config, clientSecret: undefined });
      await expect(discord.refreshAccessToken(`x`)).rejects.toThrow(
        /client secret/
      );
    });
  });
});
