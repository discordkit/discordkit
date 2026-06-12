/**
 * Next.js instrumentation hook. Runs once per server worker at startup (Node
 * runtime only), where we:
 *
 * 1. Create Better Auth's database tables if missing (`ensureMigrated`) — the
 *    schema must exist before the first auth request. This replaces running the
 *    `@better-auth/cli migrate` command by hand, and is the only way to migrate
 *    the in-memory E2E database.
 * 2. Start MSW (E2E only, `DISCORD_E2E_MOCK=1`) so the server's outbound Discord
 *    calls — Better Auth's token exchange + discordkit's /oauth2/@me + guilds —
 *    are intercepted. Normal dev / production never touch MSW.
 */
export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== `nodejs`) {
    return;
  }

  const { ensureMigrated } = await import(`#src/lib/migrate`);
  await ensureMigrated();

  if (process.env.DISCORD_E2E_MOCK === `1`) {
    const { server } = await import(`./__mocks__/node`);
    server.listen({ onUnhandledRequest: `bypass` });
  }
};
