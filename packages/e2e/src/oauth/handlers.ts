import { http, HttpResponse } from "msw";
import { Valimock } from "valimock";
import * as v from "valibot";
import {
  guildSchema,
  authorizationInfoSchema,
  authorizedUserSchema
} from "@discordkit/client";
import { pickFields } from "@discordkit/core/validations/schema";
import { rawTokenResponseSchema } from "@discordkit/oauth/types/TokenResponse";
import {
  MOCK_ACCESS_TOKEN,
  MOCK_SCOPES,
  MOCK_USERNAME,
  MOCK_GUILD_NAMES
} from "./fixtures";

/**
 * MSW handlers that stand in for Discord during the example E2E suite, so it
 * never touches a real Discord account (automating a user account violates
 * Discord's self-bot policy, and its login is CAPTCHA-gated).
 *
 * Mock responses are **schema-driven** via Valimock — the same approach the
 * client/core unit suites use — so a fixture can't drift from the shape the
 * code actually validates against. The token-response schema lives in
 * `@discordkit/oauth`; the authorization-info and partial-guild shapes come
 * from `@discordkit/client`.
 *
 * These intercept the calls the Next *server* makes (token exchange, /@me,
 * guilds). The browser's redirect to /oauth2/authorize is handled in the
 * Playwright flow. Following "don't assert on requests", the token handler
 * validates the exchange payload and 400s on a malformed one.
 */

const valimock = new Valimock({
  // snowflake is a branded numeric-string Valimock can't synthesize validly;
  // give it a fixed valid id.
  customMocks: {
    custom: (): unknown => `111111111111111111`
  }
});

/** Partial guild shape `/users/@me/guilds` returns — picked from the full schema. */
const partialGuildSchema = pickFields(guildSchema, [`id`, `name`, `icon`]);

/** The mocked user identity (schema-validated), built from the shared fixtures. */
const mockUser = v.parse(authorizedUserSchema, {
  id: `111111111111111111`,
  username: MOCK_USERNAME,
  discriminator: `0`,
  avatar: null
});

/** The full /oauth2/@me response built from the user (schema-validated). */
const mockAuthInfo = v.parse(authorizationInfoSchema, {
  application: {
    id: `444444444444444444`,
    name: `E2E App`,
    icon: null,
    description: ``
  },
  scopes: [...MOCK_SCOPES],
  expires: new Date(Date.now() + 604800_000).toISOString(),
  user: mockUser
});

/** Schema-generated partial guilds with the shared stable names for assertions. */
const mockGuilds = MOCK_GUILD_NAMES.map((name) => ({
  ...valimock.mock(partialGuildSchema),
  name,
  icon: null
}));

export const handlers = [
  // Token endpoint: authorization-code exchange AND refresh. Validate the
  // request shape; reject with 400 if the flow sent something wrong. The
  // response is generated from the oauth raw-token schema, then overridden with
  // the fixed access token the data handlers expect.
  http.post(`https://discord.com/api/oauth2/token`, async ({ request }) => {
    const body = new URLSearchParams(await request.text());
    const grantType = body.get(`grant_type`);
    if (grantType === `authorization_code`) {
      // Require a `code`. We don't require `code_verifier`: PKCE is optional in
      // the OAuth2 spec and not every client uses it (the @discordkit/oauth
      // examples do; Better Auth's Discord provider doesn't by default). The
      // mock's job is to stand in for a successful exchange, not to enforce
      // PKCE — that's the app's concern, covered by the oauth package's tests.
      if (body.get(`code`) === null) {
        return HttpResponse.json({ error: `invalid_request` }, { status: 400 });
      }
    } else if (grantType !== `refresh_token`) {
      return HttpResponse.json(
        { error: `unsupported_grant_type` },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      ...valimock.mock(rawTokenResponseSchema),
      access_token: MOCK_ACCESS_TOKEN,
      token_type: `Bearer`,
      refresh_token: `mock-refresh-token`,
      scope: MOCK_SCOPES.join(` `)
    });
  }),

  // Token revocation (logout).
  http.post(`https://discord.com/api/oauth2/token/revoke`, () =>
    HttpResponse.json({})
  ),

  // /oauth2/@me — authorization info (profile panel). Now called via
  // @discordkit/client's Fetcher, which uses the versioned `/api/v10` base.
  http.get(`https://discord.com/api/v10/oauth2/@me`, ({ request }) => {
    if (
      request.headers.get(`authorization`) !== `Bearer ${MOCK_ACCESS_TOKEN}`
    ) {
      return HttpResponse.text(`401: Unauthorized`, { status: 401 });
    }
    return HttpResponse.json(mockAuthInfo);
  }),

  // /users/@me/guilds — the guild list, called via @discordkit/client with the
  // user's bearer token (asUser). Require the token so we assert it arrived.
  http.get(`https://discord.com/api/v10/users/@me/guilds`, ({ request }) => {
    if (
      request.headers.get(`authorization`) !== `Bearer ${MOCK_ACCESS_TOKEN}`
    ) {
      return HttpResponse.text(`401: Unauthorized`, { status: 401 });
    }
    return HttpResponse.json(mockGuilds);
  }),

  // /users/@me — the current user. The @discordkit/oauth examples don't call
  // this, but a third-party auth framework (e.g. Better Auth in
  // with-nextjs-better-auth) fetches it during sign-in to populate its own user
  // record. Returns the same mocked identity, plus the email/verified fields
  // such frameworks expect. Regex matcher because some clients percent-encode
  // the `@` as `%40` (Better Auth does), which a literal string path won't match.
  http.get(/https:\/\/discord\.com\/api\/users\/(@|%40)me$/, ({ request }) => {
    if (
      request.headers.get(`authorization`) !== `Bearer ${MOCK_ACCESS_TOKEN}`
    ) {
      return HttpResponse.text(`401: Unauthorized`, { status: 401 });
    }
    return HttpResponse.json({
      ...mockUser,
      email: `${MOCK_USERNAME}@example.com`,
      verified: true
    });
  })
];
