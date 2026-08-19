# Changelog



## 0.1.2
<sub>2026-08-19</sub>

- [#82](https://github.com/discordkit/discordkit/pull/82)  *(patch)* Thanks [@Saeris](https://github.com/Saeris)!
  Fixes JSR publishing for the packages that use valibot.

  valibot was declared only as a peer dependency, which npm resolves through the consumer's tree but JSR cannot: deno has no `peerDependencies` equivalent and resolves npm packages through the installed dependency graph. Publishing failed with `Module not found "file:///src/requests/valibot"`.

  It is now also a dev dependency, so it resolves at publish time. The peer dependency is unchanged, so what you install from npm is the same.

## 0.1.1
<sub>2026-08-19</sub>

- [#80](https://github.com/discordkit/discordkit/pull/80)  *(patch)* Thanks [@Saeris](https://github.com/Saeris)!
  Every package now publishes to [JSR](https://jsr.io/@discordkit) alongside npm.

  Installation from npm is unchanged, and this version ships the same code as the one before it — the bump exists so each package has a version to publish to JSR for the first time.

  ```sh
  deno add jsr:@discordkit/client
  ```

  JSR publishes from source rather than from `dist/`, so the packages carry an explicit export map generated from the same subpaths npm resolves through its `"./*"` wildcard.

## 0.1.0
<sub>2026-06-12</sub>

- [#56](https://github.com/discordkit/discordkit/pull/56)  *(minor)* Thanks [@Saeris](https://github.com/Saeris)! - Added @discordkit/oauth: framework-agnostic Discord OAuth2 utilities (authorization-code flow with PKCE, refresh, client-credentials, revoke), Web-standard login/callback handlers with Next/Astro/Web subpaths. Token responses are defined by Valibot schemas (source of truth for the inferred types) and validated at runtime; valibot is a peer dependency.
  Added `getCurrentAuthorizationInfo` (`GET /oauth2/@me`) to @discordkit/client under a new `oauth2` endpoint group — it's a bearer-authenticated Discord API call, so it lives alongside the other client Fetchers (use it inside an `asUser` scope) rather than in the OAuth-flow package.
