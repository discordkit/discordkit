<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-dark.svg">
  <img alt="Discordkit" src="https://raw.githubusercontent.com/discordkit/discordkit/main/static/logo-light.svg">
</picture>

[![CI status][ci_badge]][ci]

Discord OAuth2 login and authenticated API calls in **TanStack Start**.

</div>

---

A minimal TanStack Start app demonstrating Discord OAuth2 login with [`@discordkit/oauth`](../../packages/oauth) and authenticated API calls with [`@discordkit/client`](../../packages/client). The TanStack Start counterpart to [`with-nextjs`](../with-nextjs) and [`with-astro`](../with-astro) — same flow, idiomatic TanStack Start shape.

1. **Login** — redirect to Discord's consent screen (Authorization Code + PKCE).
2. **Callback** — verify CSRF state, exchange the code, store tokens in a session cookie.
3. **Profile + guilds** — fetched server-side in the `/dashboard` route loader (`/oauth2/@me` and `getCurrentUserGuilds`), rendered directly.
4. **Refresh / Logout** — server routes hit from the dashboard's buttons.

## 🏗️ How it's wired

- **`src/lib/discord.ts`** — the OAuth2 client + login/callback handler (`@discordkit/oauth`). The `@sensitive` client secret never reaches the client.
- **`src/lib/session.ts`** — a signed (`jose`) httpOnly session cookie. Uses TanStack Start's `getCookie`/`setCookie` (ambient request context).
- **`src/routes/api.auth.*.ts`** — server routes for login/callback/refresh/logout (`createFileRoute(...)({ server: { handlers } })`, Web-standard Request→Response).
- **`src/routes/index.tsx`** — public landing (login button / link to dashboard).
- **`src/routes/dashboard.tsx`** — protected: a `beforeLoad` guard redirects unauthenticated visitors to `/`, and the `loader` fetches profile + guilds server-side.
- **`src/server.ts`** — custom server entry that starts MSW for E2E (when `DISCORD_E2E_MOCK` is set); otherwise behaves like the default entry.

Runs under Vite+ (`vp dev`/`vp build`) with the `nitro/vite` plugin providing the server runtime. The shared E2E flow lives in [`@discordkit/e2e`](../../packages/e2e) and is reused verbatim across examples.

## 🔑 Environment variables

Copy `.env.schema` to `.env` and fill these in. `.env` is gitignored; `.env.schema` is committed and declares the shape, which Varlock validates at build and start.

| Variable                | Required | Where to get it                                                                                                                 |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DISCORD_CLIENT_ID`     | yes      | [Developer Portal][portal] → your app → **OAuth2 → General**. Public; it appears in the authorize URL.                          |
| `DISCORD_CLIENT_SECRET` | yes      | Same page, **Reset Secret**. Server-only — never send it to the browser.                                                        |
| `DISCORD_REDIRECT_URI`  | yes      | You choose it, then register the **exact** URL under **OAuth2 → Redirects**. Locally: `http://localhost:3000/api/auth/callback` |
| `SESSION_SECRET`        | yes      | Generate one: `openssl rand -base64 32`. Signs the session cookie.                                                              |

## 📦 Setup

1. Create a Discord application at the [developer dashboard](https://discord.com/developers/applications).
2. Copy the **Client ID** + **Client Secret** (OAuth2 → General).
3. Add `http://localhost:3000/api/auth/callback` under **OAuth2 → Redirects**.
4. Copy `.env.schema` to a local `.env` (gitignored — never commit secrets):

   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

5. `vp install` then `vp run dev`, and open <http://localhost:3000>.

## A note on production

This keeps session handling intentionally small to focus on the OAuth2 flow. For a production app, consider a dedicated auth library — `@discordkit/oauth` provides the framework-agnostic primitives such libraries build on.

## 🥂 License

[MIT][license] © [Drake Costa][personal-website]

[ci_badge]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml/badge.svg
[ci]: https://github.com/discordkit/discordkit/actions/workflows/ci.yml
[license]: https://github.com/discordkit/discordkit/blob/main/LICENSE.md
[personal-website]: https://saeris.gg
[portal]: https://discord.com/developers/applications
