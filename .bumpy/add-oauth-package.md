---
"@discordkit/oauth": minor
---

Added @discordkit/oauth: framework-agnostic Discord OAuth2 utilities (authorization-code flow with PKCE, refresh, client-credentials, revoke), Web-standard login/callback handlers with Next/Astro/Web subpaths, and getCurrentAuthorizationInfo for /oauth2/@me. Token and authorization-info responses are defined by Valibot schemas (source of truth for the inferred types) and validated at runtime; valibot is a peer dependency.
