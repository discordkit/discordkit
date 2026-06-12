# discordkit — Next.js OAuth2 example

A minimal Next.js (App Router) app demonstrating Discord OAuth2 login with
[`@discordkit/oauth`](../../packages/oauth) and authenticated API calls with
[`@discordkit/client`](../../packages/client).

It walks the full loop:

1. **Login** — redirect to Discord's consent screen (Authorization Code flow + PKCE).
2. **Callback** — verify CSRF state, exchange the code for tokens, store them in a session cookie.
3. **Profile** — read `/oauth2/@me` (`getCurrentAuthorizationInfo`).
4. **Guilds** — list the user's guilds (`getCurrentUserGuilds` from `@discordkit/client`).
5. **Refresh / Logout** — refresh the access token, or revoke it and clear the session.

## How it's wired

- **`src/lib/discord.ts`** — the OAuth2 client + the shared login/callback handler
  (`createAuthHandler`). `server-only`, so the client secret never reaches the browser.
- **`src/lib/session.ts`** — a signed (`jose`) httpOnly session cookie holding the tokens.
  This is the [pattern the Next.js docs recommend](https://nextjs.org/docs/app/guides/authentication)
  for stateless sessions.
- **`src/app/api/auth/{login,callback,logout,refresh}/route.ts`** — the auth endpoints.
  `login`/`callback` are the oauth package's Web-standard handlers handed straight
  to Next Route Handlers.
- **`src/app/api/{me,guilds}/route.ts`** — server routes that read the session and call
  Discord with the user's bearer token. The token stays server-side; the browser only
  ever receives the resulting JSON.
- **`src/components/*`** — client components fetching the server routes with
  [React Query](https://tanstack.com/query) (no fetching in `useEffect`).

### The secret boundary

The point of the server-route indirection is that **secrets never cross to the client**:
the client secret and session key live only in `server-only` modules and route handlers,
and [Varlock](https://varlock.dev) marks them `@sensitive` so importing them into a client
component is a build-time error. The browser only sees `/api/me` and `/api/guilds` results.

## Setup

1. Create a Discord application at the
   [developer dashboard](https://discord.com/developers/applications).
2. Under **OAuth2 → General**, copy the **Client ID** and **Client Secret**.
3. Under **OAuth2 → Redirects**, add `http://localhost:3000/api/auth/callback`.
4. Copy `.env.schema` to a local `.env` and fill in the values (the real `.env` is
   gitignored — never commit secrets):

   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

5. Install and run:

   ```bash
   vp install
   vp dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and click **Login with Discord**.

## Deploy to Vercel

Set the four environment variables (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
`DISCORD_REDIRECT_URI`, `SESSION_SECRET`) in your Vercel project settings, and update
`DISCORD_REDIRECT_URI` (and the registered redirect on the Discord dashboard) to your
deployed URL, e.g. `https://your-app.vercel.app/api/auth/callback`.

## A note on production

This example keeps session handling intentionally small to focus on the OAuth2 flow.
For a production app, consider a dedicated authentication library — it will handle
session rotation, CSRF, and many edge cases for you. The Next.js docs list good options
(Better Auth, Auth.js, Clerk, WorkOS, and others):
<https://nextjs.org/docs/app/guides/authentication#auth-libraries>. `@discordkit/oauth`
provides the framework-agnostic primitives such libraries can build on.
