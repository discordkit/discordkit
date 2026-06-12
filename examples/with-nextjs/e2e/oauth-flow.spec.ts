import { registerOAuthFlowTests } from "@discordkit/e2e/oauth-e2e";

// The OAuth2 flow tests are shared across every framework example. This file
// registers them under this example's playwright.config.ts (which boots the
// Next dev server with Discord mocked via MSW — see src/instrumentation.ts).
// The Astro / Workers examples will have an identical one-line spec.
registerOAuthFlowTests();
