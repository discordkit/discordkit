---
"@discordkit/oauth": minor
"@discordkit/client": minor
---

Added @discordkit/oauth: framework-agnostic Discord OAuth2 utilities (authorization-code flow with PKCE, refresh, client-credentials, revoke), Web-standard login/callback handlers with Next/Astro/Web subpaths. Token responses are defined by Valibot schemas (source of truth for the inferred types) and validated at runtime; valibot is a peer dependency.

Added `getCurrentAuthorizationInfo` (`GET /oauth2/@me`) to @discordkit/client under a new `oauth2` endpoint group — it's a bearer-authenticated Discord API call, so it lives alongside the other client Fetchers (use it inside an `asUser` scope) rather than in the OAuth-flow package.
