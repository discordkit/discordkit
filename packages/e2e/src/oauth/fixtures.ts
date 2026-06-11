/**
 * Plain, dependency-free fixtures shared between the MSW handlers (which build
 * schema-validated responses around them) and the Playwright flow (which
 * asserts on them). Kept free of valibot/msw/client imports so the Playwright
 * runner — plain Node, no bundler — can import them without dragging in the
 * handlers' heavy dependency graph.
 */

/** The access token the mock issues; data handlers require it on the bearer header. */
export const MOCK_ACCESS_TOKEN = `mock-access-token`;

/** The scopes the mock reports as granted. */
export const MOCK_SCOPES = [`identify`, `email`, `guilds`] as const;

/** The mocked user's username — asserted in the profile panel. */
export const MOCK_USERNAME = `e2e-tester`;

/** Stable guild names the flow asserts appear in the server list. */
export const MOCK_GUILD_NAMES = [
  `Test Guild Alpha`,
  `Test Guild Beta`
] as const;
