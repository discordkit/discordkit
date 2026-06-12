# discordkit — Waku OAuth2 example

A minimal [Waku](https://waku.gg) app demonstrating Discord OAuth2 login with
[`@discordkit/oauth`](../../packages/oauth) and authenticated API calls with
[`@discordkit/client`](../../packages/client). The Waku counterpart to
[`with-nextjs`](../with-nextjs), [`with-astro`](../with-astro), and
[`with-tanstack-start`](../with-tanstack-start) — same flow, idiomatic Waku
(React Server Components) shape.

1. **Login** — redirect to Discord's consent screen (Authorization Code + PKCE).
2. **Callback** — verify CSRF state, exchange the code, store tokens in a session cookie.
3. **Profile + guilds** — fetched server-side in the `/dashboard` server component
   (`/oauth2/@me` and `getCurrentUserGuilds`), rendered directly.
4. **Refresh / Logout** — API routes hit from the dashboard's `<form>` buttons.

## How it's wired

- **`src/lib/discord.ts`** — the OAuth2 client + login/callback handler
  (`@discordkit/oauth`). The `@sensitive` client secret never reaches the client.
- **`src/lib/session.ts`** — a signed (`jose`) httpOnly session cookie. Waku has
  no ambient mutable response, so writes produce a `Set-Cookie` *string* that the
  caller attaches to the `Response` it returns, and reads use Waku's
  `unstable_getRequest()`. (`session-shared.ts` holds the client-safe `Session`
  type + `hasUsableSession` predicate so page components never import the secret.)
- **`src/pages/_api/api/auth/*.ts`** — API routes for login/callback/refresh/logout.
  Each is a Web-standard `(Request) => Response`, so the `@discordkit/oauth`
  handler drops in as a one-liner — no adapter. (Waku strips the `_api` segment,
  so `_api/api/auth/login.ts` serves at `/api/auth/login`.)
- **`src/pages/index.tsx`** — public landing (login button / link to dashboard).
- **`src/pages/dashboard.tsx`** — protected: an async server component that
  `unstable_redirect`s unauthenticated visitors to `/`, then fetches profile +
  guilds server-side. The per-user guild call uses the core `discord.asUser()`
  helper to scope the bearer token to the request.
- **`src/pages/_interceptors/msw.ts`** — a handler interceptor that starts MSW
  for E2E (when `DISCORD_E2E_MOCK` is set); otherwise it just calls through.
- **`src/pages/_layout.tsx`** — page chrome + hoistable `<title>`/`<style>`.
  Waku owns the `<html>`/`<head>`/`<body>` shell, so the layout must not render
  it (doing so causes a hydration mismatch).

Waku runs its own Vite pipeline via the `waku` CLI; `waku.config.ts` injects the
Varlock env plugin and the `@discordkit/source` resolve condition. The shared
E2E flow lives in [`@discordkit/e2e`](../../packages/e2e) and is reused verbatim
across examples.

## Setup

1. Create a Discord application at the
   [developer dashboard](https://discord.com/developers/applications).
2. Copy the **Client ID** + **Client Secret** (OAuth2 → General).
3. Add `http://localhost:3100/api/auth/callback` under **OAuth2 → Redirects**.
4. Copy `.env.schema` to a local `.env` (gitignored — never commit secrets):

   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=http://localhost:3100/api/auth/callback
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

5. `vp install` then `vp run dev`, and open <http://localhost:3100>.

## A note on production

This keeps session handling intentionally small to focus on the OAuth2 flow. For
a production app, consider a dedicated auth library — `@discordkit/oauth` provides
the framework-agnostic primitives such libraries build on. Note also that Waku's
server-side cookie/context APIs (`unstable_getRequest`, `unstable_redirect`) are
marked `unstable_` and may change before Waku's 1.0 stable release.
