# discordkit — Astro OAuth2 example

A minimal Astro (SSR) app demonstrating Discord OAuth2 login with
[`@discordkit/oauth`](../../packages/oauth) and authenticated API calls with
[`@discordkit/client`](../../packages/client). It's the Astro counterpart to
[`with-nextjs`](../with-nextjs) — same flow, idiomatic Astro shape.

1. **Login** — redirect to Discord's consent screen (Authorization Code + PKCE).
2. **Callback** — verify CSRF state, exchange the code, store tokens in a session cookie.
3. **Profile + guilds** — fetched **server-side in the page frontmatter** (`/oauth2/@me`
   and `getCurrentUserGuilds`), rendered directly — no client round-trips.
4. **Refresh / Logout** — a small client `<script>` posts to the auth endpoints.

## How it's wired

- **`src/lib/discord.ts`** — the OAuth2 client + the login/callback endpoints
  (via `@discordkit/oauth/astro`). The `@sensitive` client secret never reaches the client.
- **`src/lib/session.ts`** — a signed (`jose`) httpOnly session cookie. Helpers take
  `Astro.cookies` explicitly (Astro passes the jar per-request, unlike Next's global).
- **`src/pages/api/auth/{login,callback,logout,refresh}.ts`** — the auth endpoints.
- **`src/pages/index.astro`** — reads the session and renders the profile + guilds in
  frontmatter (Astro's server-first model); a `<script>` wires the buttons.
- **`src/middleware.ts`** — starts MSW for E2E when `DISCORD_E2E_MOCK` is set (Astro's
  equivalent of a startup hook). No effect in normal dev/prod.

The shared E2E flow lives in [`@discordkit/e2e`](../../packages/e2e) and is reused
verbatim across the framework examples.

## Setup

1. Create a Discord application at the
   [developer dashboard](https://discord.com/developers/applications).
2. Copy the **Client ID** + **Client Secret** (OAuth2 → General).
3. Add `http://localhost:4321/api/auth/callback` under **OAuth2 → Redirects**.
4. Copy `.env.schema` to a local `.env` (gitignored — never commit secrets):

   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=http://localhost:4321/api/auth/callback
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

5. `vp install` then `vp run dev`, and open <http://localhost:4321>.

## A note on production

This keeps session handling intentionally small to focus on the OAuth2 flow. For a
production app, consider a dedicated auth library — `@discordkit/oauth` provides the
framework-agnostic primitives such libraries build on.
