---
"@discordkit/client": patch
"@discordkit/core": patch
"@discordkit/gateway": patch
"@discordkit/oauth": patch
---

Fixes JSR publishing for the packages that use valibot.

valibot was declared only as a peer dependency, which npm resolves through the consumer's tree but JSR cannot: deno has no `peerDependencies` equivalent and resolves npm packages through the installed dependency graph. Publishing failed with `Module not found "file:///src/requests/valibot"`.

It is now also a dev dependency, so it resolves at publish time. The peer dependency is unchanged, so what you install from npm is the same.
