import { registerOAuthFlowTests } from "@discordkit/e2e/oauth-e2e";

// The OAuth2 flow tests are shared across every framework example. This file
// registers them under this example's playwright.config.ts (which boots the
// Waku dev server with Discord mocked via MSW — see src/pages/_interceptors/msw).
// Identical one-liner to the with-nextjs / with-astro / with-tanstack-start specs.
registerOAuthFlowTests();
