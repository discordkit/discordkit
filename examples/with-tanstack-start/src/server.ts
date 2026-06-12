import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

/**
 * Custom server entry — only needed here to bootstrap MSW for E2E. TanStack
 * Start has no `instrumentation.ts`; the server entry runs once at startup, so
 * it's the place to start MSW (when `DISCORD_E2E_MOCK` is set) to intercept the
 * server's outbound Discord calls. Normal dev/prod are untouched — without the
 * flag this behaves exactly like the default entry.
 *
 * The handlers are shared across every framework example (@discordkit/e2e).
 */
let mswStarted = false;

const startMockServer = async (): Promise<void> => {
  if (!mswStarted && process.env.DISCORD_E2E_MOCK === `1`) {
    mswStarted = true;
    const { setupServer } = await import(`msw/node`);
    const { handlers } = await import(`@discordkit/e2e/oauth-handlers`);
    setupServer(...handlers).listen({ onUnhandledRequest: `bypass` });
  }
};

export default createServerEntry({
  async fetch(request) {
    await startMockServer();
    return handler.fetch(request);
  }
});
