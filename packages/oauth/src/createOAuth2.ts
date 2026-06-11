import type { OAuth2Scope } from "./types/OAuth2Scope.js";
import type { RawTokenResponse, TokenResponse } from "./types/TokenResponse.js";

/** Discord's user-facing authorization page (note: no `/api` segment). */
const AUTHORIZE_URL = `https://discord.com/oauth2/authorize`;
/** Discord's token endpoint. Accepts `application/x-www-form-urlencoded` only. */
const TOKEN_URL = `https://discord.com/api/oauth2/token`;
/** Discord's token revocation endpoint. */
const REVOKE_URL = `https://discord.com/api/oauth2/token/revoke`;

/** Configuration for a Discord OAuth2 client application. */
export interface OAuth2Config {
  /** The application's client ID from the Discord developer dashboard. */
  clientId: string;
  /**
   * The application's client secret. Required for the authorization-code,
   * refresh, revoke, and client-credentials grants — every call that hits the
   * token endpoint. Omit only if you exclusively build authorization URLs.
   */
  clientSecret?: string;
  /**
   * The redirect URI registered on the application. Required for building
   * authorization URLs and for the authorization-code exchange; it must match
   * one of the URIs registered on the dashboard exactly.
   */
  redirectUri?: string;
}

/** Options for {@link OAuth2.createAuthorizationURL}. */
export interface AuthorizationURLOptions {
  /** The scopes to request. */
  scopes: OAuth2Scope[];
  /** CSRF state token; generate with `generateState()` and verify on callback. */
  state?: string;
  /** PKCE code challenge from `generatePKCE()`. When set, also sends `S256`. */
  codeChallenge?: string;
  /**
   * `consent` (default) re-prompts the user every time; `none` skips the
   * prompt if they have already authorized the same scopes.
   */
  prompt?: `consent` | `none`;
  /**
   * Bot-authorization permissions bitfield, sent only when the `bot` scope is
   * requested. Stringified into the `permissions` query parameter.
   */
  permissions?: string;
  /** Pre-select a guild on the bot-authorization page. */
  guildId?: string;
  /** Hide the guild dropdown on the bot-authorization page. */
  disableGuildSelect?: boolean;
}

/** Options for {@link OAuth2.validateAuthorizationCode}. */
export interface ValidateAuthorizationCodeOptions {
  /** The PKCE verifier from `generatePKCE()`, if the auth URL used a challenge. */
  codeVerifier?: string;
}

/** A configured Discord OAuth2 client. Every method is a pure function over config. */
export interface OAuth2 {
  /** Build the URL to redirect a user to for authorization. Performs no network call. */
  createAuthorizationURL: (options: AuthorizationURLOptions) => URL;
  /** Exchange an authorization `code` (from the callback) for tokens. */
  validateAuthorizationCode: (
    code: string,
    options?: ValidateAuthorizationCodeOptions
  ) => Promise<TokenResponse>;
  /** Exchange a `refreshToken` for a fresh access token. */
  refreshAccessToken: (refreshToken: string) => Promise<TokenResponse>;
  /** Obtain an app-only token via the client-credentials grant (no user). */
  clientCredentialsGrant: (scopes: OAuth2Scope[]) => Promise<TokenResponse>;
  /** Revoke an access or refresh token. */
  revokeToken: (token: string) => Promise<void>;
}

/**
 * Actionable next-steps for the OAuth2 `error` codes Discord returns from the
 * token endpoint (RFC 6749 §5.2). Keyed by the `error` field; anything not
 * listed falls back to a generic hint.
 */
const TOKEN_ERROR_HINTS: Record<string, string> = {
  invalid_grant: `The authorization code or refresh token is expired, already used, or doesn't match this client. Authorization codes are single-use and short-lived — start the flow again to get a fresh one.`,
  invalid_client: `The client ID or secret is wrong. Double-check both against OAuth2 → General in your app on the Discord developer dashboard, and reset the secret if you're unsure.`,
  invalid_request: `The request was missing a required parameter or used an unsupported value. If you used PKCE, make sure the same codeVerifier from generatePKCE() is passed to validateAuthorizationCode.`,
  redirect_uri_mismatch: `The redirectUri doesn't exactly match one registered on the app. Add it under OAuth2 → Redirects on the Discord developer dashboard (it must match character-for-character, including the scheme and any trailing slash).`,
  invalid_scope: `One of the requested scopes is unknown or not approved for this app. Remove it, or request access if it's a partner-gated scope.`,
  unauthorized_client: `This app isn't allowed to use the requested grant type. Check the OAuth2 settings on the Discord developer dashboard.`
};

/**
 * Turn a failed token-endpoint response into a message that says what failed,
 * why, and what to do next — rather than just echoing a status code.
 */
const describeTokenError = (
  url: string,
  response: Response,
  body: string
): string => {
  // Discord returns RFC 6749 JSON errors: { error, error_description }.
  const parsed: { error?: string; error_description?: string } = (() => {
    try {
      return body.length === 0 ? {} : JSON.parse(body);
    } catch {
      return {};
    }
  })();

  const code = parsed.error;
  const detail = parsed.error_description ?? (code === undefined ? body : ``);
  const hint =
    (code === undefined ? undefined : TOKEN_ERROR_HINTS[code]) ??
    `Check the request parameters and your app's OAuth2 settings on the Discord developer dashboard (https://discord.com/developers/applications).`;

  return [
    `Discord rejected the OAuth2 request to ${url} (HTTP ${response.status}${
      code === undefined ? `` : `, ${code}`
    }).`,
    detail.length === 0 ? undefined : `Discord said: ${detail}`,
    hint
  ]
    .filter((line): line is string => line !== undefined)
    .join(`\n\n`);
};

/** Normalize Discord's snake_case token payload to the camelCase public shape. */
const normalizeToken = (raw: RawTokenResponse): TokenResponse => ({
  accessToken: raw.access_token,
  tokenType: raw.token_type,
  expiresIn: raw.expires_in,
  ...(raw.refresh_token === undefined
    ? {}
    : { refreshToken: raw.refresh_token }),
  scope: raw.scope.length === 0 ? [] : raw.scope.split(` `),
  ...(raw.webhook === undefined ? {} : { webhook: raw.webhook })
});

/**
 * Create a Discord OAuth2 client from an application's credentials. The
 * returned object is a set of pure functions closing over `config`; it holds
 * no mutable state and performs no I/O until a method is called.
 *
 * Every token-endpoint call uses HTTP Basic authentication
 * (`client_id:client_secret`) and an `application/x-www-form-urlencoded`
 * body — Discord rejects JSON on these endpoints — and goes straight to
 * `fetch`, bypassing the bot-oriented request layer in `@discordkit/core`.
 *
 * @example
 * ```ts
 * const discord = createOAuth2({ clientId, clientSecret, redirectUri });
 * const url = discord.createAuthorizationURL({ scopes: ["identify", "email"] });
 * // ...redirect, then on the callback:
 * const tokens = await discord.validateAuthorizationCode(code);
 * ```
 */
export const createOAuth2 = (config: OAuth2Config): OAuth2 => {
  const { clientId, clientSecret, redirectUri } = config;

  /** Basic-auth header value for token-endpoint requests. */
  const basicAuth = (): string => {
    if (clientSecret === undefined) {
      throw new Error(
        `Can't call the Discord token endpoint without a client secret. ` +
          `Token requests (validateAuthorizationCode, refreshAccessToken, ` +
          `clientCredentialsGrant, revokeToken) authenticate with HTTP Basic ` +
          `auth, which needs both your client ID and secret. ` +
          `To fix: pass it as createOAuth2({ clientSecret }) — you'll find it ` +
          `under OAuth2 → Reset Secret in your app on the Discord developer ` +
          `dashboard (https://discord.com/developers/applications). ` +
          `Keep it server-side; never ship it to the browser.`
      );
    }
    return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  };

  /**
   * POST form-encoded params to a token endpoint and return the parsed JSON
   * body (or `undefined` for an empty 200, as the revoke endpoint returns).
   * `JSON.parse` yields `any`, which flows into the declared return without
   * an explicit assertion; callers narrow it to their concrete shape.
   */
  const postForm = async (
    url: string,
    params: Record<string, string>
  ): Promise<RawTokenResponse | undefined> => {
    const response = await fetch(url, {
      method: `POST`,
      headers: {
        Authorization: basicAuth(),
        "Content-Type": `application/x-www-form-urlencoded`,
        Accept: `application/json`
      },
      body: new URLSearchParams(params).toString()
    });
    if (!response.ok) {
      throw new Error(describeTokenError(url, response, await response.text()));
    }
    const text = await response.text();
    return text.length === 0 ? undefined : JSON.parse(text);
  };

  /** Exchange via the token endpoint, asserting a (non-empty) token body came back. */
  const tokenGrant = async (
    params: Record<string, string>
  ): Promise<TokenResponse> => {
    const raw = await postForm(TOKEN_URL, params);
    if (raw === undefined) {
      throw new Error(
        `The Discord token endpoint returned a success status but an empty ` +
          `body, so there's no access token to read. This is unexpected and ` +
          `usually transient. To fix: retry the request; if it persists, ` +
          `check the Discord status page (https://discordstatus.com).`
      );
    }
    return normalizeToken(raw);
  };

  return {
    createAuthorizationURL: ({
      scopes,
      state,
      codeChallenge,
      prompt,
      permissions,
      guildId,
      disableGuildSelect
    }) => {
      if (redirectUri === undefined) {
        throw new Error(
          `Can't build an authorization URL without a redirect URI — it tells ` +
            `Discord where to send the user back after they approve. ` +
            `To fix: pass it as createOAuth2({ redirectUri }), and register ` +
            `the exact same URL under OAuth2 → Redirects in your app on the ` +
            `Discord developer dashboard (https://discord.com/developers/applications).`
        );
      }
      const url = new URL(AUTHORIZE_URL);
      // Build the param entries functionally, dropping unset optionals, so the
      // URLSearchParams construction stays a single pure expression.
      const entries: Array<[string, string]> = [
        [`client_id`, clientId],
        [`redirect_uri`, redirectUri],
        [`response_type`, `code`],
        [`scope`, scopes.join(` `)],
        ...(state === undefined ? [] : [[`state`, state] as [string, string]]),
        ...(codeChallenge === undefined
          ? []
          : [
              [`code_challenge`, codeChallenge] as [string, string],
              [`code_challenge_method`, `S256`] as [string, string]
            ]),
        ...(prompt === undefined
          ? []
          : [[`prompt`, prompt] as [string, string]]),
        ...(permissions === undefined
          ? []
          : [[`permissions`, permissions] as [string, string]]),
        ...(guildId === undefined
          ? []
          : [[`guild_id`, guildId] as [string, string]]),
        ...(disableGuildSelect === undefined
          ? []
          : [
              [`disable_guild_select`, String(disableGuildSelect)] as [
                string,
                string
              ]
            ])
      ];
      url.search = new URLSearchParams(entries).toString();
      return url;
    },

    validateAuthorizationCode: async (code, options) => {
      if (redirectUri === undefined) {
        throw new Error(
          `Can't exchange the authorization code without a redirect URI. ` +
            `Discord requires the same redirectUri used to start the flow so ` +
            `it can verify the exchange. To fix: pass it as ` +
            `createOAuth2({ redirectUri }), matching the value you used to ` +
            `build the authorization URL.`
        );
      }
      return tokenGrant({
        grant_type: `authorization_code`,
        code,
        redirect_uri: redirectUri,
        ...(options?.codeVerifier === undefined
          ? {}
          : { code_verifier: options.codeVerifier })
      });
    },

    refreshAccessToken: async (refreshToken) =>
      tokenGrant({
        grant_type: `refresh_token`,
        refresh_token: refreshToken
      }),

    clientCredentialsGrant: async (scopes) =>
      tokenGrant({
        grant_type: `client_credentials`,
        scope: scopes.join(` `)
      }),

    revokeToken: async (token) => {
      await postForm(REVOKE_URL, { token });
    }
  };
};
