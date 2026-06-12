# Changelog

## 0.1.0
<sub>2026-06-12</sub>

- [#56](https://github.com/discordkit/discordkit/pull/56)  *(minor)* Thanks [@Saeris](https://github.com/Saeris)! - Added @discordkit/oauth: framework-agnostic Discord OAuth2 utilities (authorization-code flow with PKCE, refresh, client-credentials, revoke), Web-standard login/callback handlers with Next/Astro/Web subpaths. Token responses are defined by Valibot schemas (source of truth for the inferred types) and validated at runtime; valibot is a peer dependency.
  Added `getCurrentAuthorizationInfo` (`GET /oauth2/@me`) to @discordkit/client under a new `oauth2` endpoint group — it's a bearer-authenticated Discord API call, so it lives alongside the other client Fetchers (use it inside an `asUser` scope) rather than in the OAuth-flow package.
