import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { ENV } from "varlock/env";

/**
 * The Better Auth server instance. Unlike the other examples (which use
 * `@discordkit/oauth` to own the OAuth flow), here a third-party auth framework
 * owns login, sessions, and token storage — discordkit is used only for the
 * authenticated Discord API calls afterward (see `lib/discord.ts`).
 *
 * Better Auth is database-backed: the session cookie holds an id, and the
 * Discord access/refresh tokens live in the `account` table. That persistence
 * is exactly what lets `auth.api.getAccessToken` hand us a fresh Discord token
 * for discordkit's per-user calls.
 *
 * Database: Node's built-in `node:sqlite` (no external server, no extra
 * dependency). In a real serverless deployment you'd point `database` at a
 * managed Postgres/Turso/etc. connection instead.
 *
 * A file DB (not `:memory:`) on purpose: Next's instrumentation hook and the
 * request handlers can load this module in separate module graphs under
 * Turbopack, and an in-memory SQLite is per-instance — so the startup migration
 * would create tables in one copy while requests read an empty other copy. A
 * file is shared across both. E2E uses a separate throwaway file (gitignored,
 * recreated each run) so it never collides with the dev database.
 */
const database = new DatabaseSync(
  process.env.DISCORD_E2E_MOCK === `1` ? `./e2e.sqlite` : `./better-auth.sqlite`
);

export const auth = betterAuth({
  database,
  baseURL: ENV.BETTER_AUTH_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  socialProviders: {
    discord: {
      clientId: ENV.DISCORD_CLIENT_ID,
      clientSecret: ENV.DISCORD_CLIENT_SECRET,
      // `scope` adds to Better Auth's defaults (`identify`, `email`) rather than
      // replacing them, so we only list the extra scope this example needs — the
      // guild list. (Listing `identify`/`email` here too would just duplicate
      // them in the authorize URL.)
      scope: [`guilds`]
    }
  }
});
