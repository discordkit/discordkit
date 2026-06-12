# discordkit — Next.js + Better Auth example

A Next.js (App Router) app that uses **[Better Auth](https://better-auth.com)**
— a full third-party auth framework — to own the Discord OAuth2 login, then uses
[`@discordkit/client`](../../packages/client) to make authenticated Discord API
calls with the token Better Auth obtained.

This is the counterpart to the [`with-nextjs`](../with-nextjs) example, which
does the same thing with discordkit's own [`@discordkit/oauth`](../../packages/oauth).
Here, **discordkit does not touch the OAuth flow at all** — it only consumes the
access token a real auth library manages. The UI and E2E assertions are
identical; only the auth internals differ.

1. **Login** — `authClient.signIn.social({ provider: "discord" })` hands the
   flow to Better Auth, which redirects to Discord and handles the callback at
   `/api/auth/callback/discord`.
2. **Session + tokens** — Better Auth stores the session and the Discord
   access/refresh tokens in its database (the `account` table).
3. **Profile + guilds** — fetched client-side via React Query through the
   `/api/me` + `/api/guilds` routes, which ask Better Auth for a fresh Discord
   token (`auth.api.getAccessToken`) and call Discord with discordkit.
4. **Refresh / Logout** — Better Auth refreshes the token transparently; logout
   is `authClient.signOut`.

## How it's wired

- **`src/lib/auth.ts`** — the Better Auth server instance: the Discord social
  provider (with the `identify`, `email`, `guilds` scopes) and a `node:sqlite`
  database. (Better Auth is database-backed — that persistence is what lets it
  hand back a Discord token later. In production you'd point `database` at a
  managed Postgres/Turso/etc.)
- **`src/app/api/auth/[...all]/route.ts`** — mounts Better Auth's entire API
  (`toNextJsHandler`): sign-in, callback, sign-out, session, get-access-token.
- **`src/lib/discord.ts`** — `asCurrentUser(fn)`: the integration seam. Gets the
  signed-in user's Discord token from Better Auth (`auth.api.getAccessToken`,
  auto-refreshed) and runs a discordkit Fetcher with it via `discord.asUser`.
- **`src/app/api/{me,guilds}/route.ts`** — call `getCurrentAuthorizationInfo` and
  `getCurrentUserGuilds` through `asCurrentUser`. The token stays server-side.
- **`src/app/page.tsx`** / **`dashboard/page.tsx`** — public landing /
  protected dashboard; the dashboard is guarded by `middleware.ts` (an
  optimistic Better Auth session-cookie check).

The shared MSW handlers in [`@discordkit/e2e`](../../packages/e2e) intercept the
Discord calls — including Better Auth's own token exchange — so the E2E runs with
no real Discord account.

## Setup

1. Create a Discord application at the
   [developer dashboard](https://discord.com/developers/applications).
2. Copy the **Client ID** + **Client Secret** (OAuth2 → General).
3. Add `http://localhost:3000/api/auth/callback/discord` under
   **OAuth2 → Redirects** (note the `/discord` suffix — Better Auth derives this
   from `BETTER_AUTH_URL`).
4. Copy `.env.schema` to a local `.env` (gitignored — never commit secrets):

   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=$(openssl rand -base64 32)
   ```

5. `vp install` then `vp run dev`, and open <http://localhost:3000>.

## A note on production

Better Auth handles session security, token storage, and refresh for you — the
tradeoff vs. the lightweight `@discordkit/oauth` approach is that it needs a
database. Swap the `node:sqlite` dev database in `lib/auth.ts` for a managed
connection (Postgres, Turso, …) when deploying.
