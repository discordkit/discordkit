/**
 * Next.js instrumentation hook. Runs once per server worker at startup — the
 * sanctioned place to start MSW so it intercepts the server's outbound Discord
 * requests during E2E.
 *
 * Gated so it only runs when explicitly testing (`DISCORD_E2E_MOCK=1`) and only
 * in the Node.js runtime (MSW's node server can't run on the edge runtime).
 * Normal `vp dev` / production never touch this.
 */
export const register = async (): Promise<void> => {
  if (
    process.env.DISCORD_E2E_MOCK === `1` &&
    process.env.NEXT_RUNTIME === `nodejs`
  ) {
    const { server } = await import(`./mocks/node`);
    server.listen({ onUnhandledRequest: `bypass` });
  }
};
