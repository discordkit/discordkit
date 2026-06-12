import { registerOAuthFlowTests } from "@discordkit/e2e/oauth-e2e";

// The OAuth2 flow tests are shared across every framework example. This file
// registers them under this example's playwright.config.ts (which boots the
// Astro dev server with Discord mocked via MSW — see src/middleware.ts).
// Identical to the with-nextjs spec: the flow drives the same UI + Discord API
// surface, so it works unchanged across frameworks.
registerOAuthFlowTests();
