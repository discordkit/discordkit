<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![npm version][npm_badge]][npm] [![jsr version][jsr_badge]][jsr] [![CI status][ci_badge]][ci]

Framework-agnostic Discord [OAuth2][oauth_docs] utilities: PKCE authorize, token exchange, and refresh.

</div>

---

## 📦 Installation

```bash
npm install --save @discordkit/oauth
# or
yarn add @discordkit/oauth
```

No peer dependencies. The package uses the Web Crypto API and `fetch`, both of which every supported runtime provides.

## 🔧 Usage

`createOAuth2` returns a client for the three calls the flow needs: build an authorize URL, exchange the code, and refresh a token.

```ts
import { createOAuth2, generateState, generatePKCE } from "@discordkit/oauth";

const discord = createOAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI
});

// 1. Send the user to Discord. Keep `state` and `codeVerifier` for step 2 —
//    CSRF and PKCE both depend on carrying them across the round trip.
const state = generateState();
const { codeChallenge, codeVerifier } = await generatePKCE();

const url = discord.createAuthorizationURL({
  scopes: [`identify`, `guilds`],
  state,
  codeChallenge
});

// 2. Exchange the code Discord sends back.
const tokens = await discord.validateAuthorizationCode(code, { codeVerifier });

// 3. Later, once the access token expires. `refreshToken` is optional because
//    the client-credentials grant does not issue one.
if (tokens.refreshToken) {
  const refreshed = await discord.refreshAccessToken(tokens.refreshToken);
}
```

`clientCredentialsGrant` and `revokeToken` round out the client for app-only tokens and logout.

Pass the access token to [`@discordkit/client`][client] to make requests as that user:

```ts
import { discord as session, getCurrentUser } from "@discordkit/client";

using user = session.asUser(tokens.accessToken);
const profile = await user.request(() => getCurrentUser());
```

### The full flow, as two route handlers

Most apps need the same two endpoints: one that redirects to Discord, one that receives the callback. `createAuthHandler` builds both, and owns the PKCE verifier and state cookies so you do not have to.

```ts
import { createAuthHandler } from "@discordkit/oauth";

export const authHandler = createAuthHandler({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI,
  scopes: [`identify`, `guilds`],
  successRedirect: `/dashboard`,
  onSuccess: async (tokens) => {
    // Persist the tokens however your app manages sessions.
    await saveSession(tokens);
  }
});

// Wire `authHandler.login` and `authHandler.callback` to your two routes.
```

## ⚙️ Configuration

| Option            | Required | Description                                                                           |
| ----------------- | -------- | ------------------------------------------------------------------------------------- |
| `clientId`        | yes      | Your application's client ID.                                                         |
| `clientSecret`    | yes      | Your application's client secret. Server-side only.                                   |
| `redirectUri`     | yes      | Must match a redirect URI registered in the Developer Portal, exactly.                |
| `scopes`          | handler  | The [scopes][scopes] to request. `identify` is the minimum for knowing who logged in. |
| `successRedirect` | no       | Where the callback sends the user once `onSuccess` resolves.                          |
| `onSuccess`       | no       | Receives the tokens. This is where your app persists its own session.                 |

The client secret must never reach the browser. Keep the module that constructs the client server-only.

## 🧩 Framework adapters

`@discordkit/oauth/next` and `@discordkit/oauth/astro` wrap the handler in each framework's route signature. Both are thin: they translate that framework's request and response types, and nothing else.

```ts
import { createDiscordAuth } from "@discordkit/oauth/next";

export const { GET } = createDiscordAuth(authHandler);
```

Any other framework can use `createAuthHandler` directly — it takes and returns Web-standard `Request` and `Response`.

## 📣 Acknowledgements

OAuth2 documentation taken from Discord's [Official API docs][discord_api].

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]

[npm_badge]: https://img.shields.io/npm/v/@discordkit/oauth.svg?style=flat
[npm]: https://www.npmjs.com/package/@discordkit/oauth
[jsr_badge]: https://img.shields.io/jsr/v/@discordkit/oauth
[jsr]: https://jsr.io/@discordkit/oauth
[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[client]: https://www.npmjs.com/package/@discordkit/client
[discord_api]: https://discord.com/developers/docs
[oauth_docs]: https://discord.com/developers/docs/topics/oauth2
[scopes]: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
