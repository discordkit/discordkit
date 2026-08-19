---
"@discordkit/client": patch
"@discordkit/core": patch
"@discordkit/gateway": patch
"@discordkit/electron": patch
"@discordkit/native": patch
"@discordkit/oauth": patch
"@discordkit/tauri": patch
---

Every package now publishes to [JSR](https://jsr.io/@discordkit) alongside npm.

Installation from npm is unchanged, and this version ships the same code as the one before it — the bump exists so each package has a version to publish to JSR for the first time.

```sh
deno add jsr:@discordkit/client
```

JSR publishes from source rather than from `dist/`, so the packages carry an explicit export map generated from the same subpaths npm resolves through its `"./*"` wildcard.
