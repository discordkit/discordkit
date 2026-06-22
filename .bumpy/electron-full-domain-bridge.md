---
"@discordkit/electron": minor
---

Expanded the Electron bridge from presence + auth + status/log to a full mirror of every `@discordkit/native` domain (users, relationships, activity-invites, lobbies, messaging, voice) — **composed per-domain so it preserves tree-shaking**. Each domain is its own subpath on all three sides (`@discordkit/electron/{main,preload,renderer}/<domain>`); an app wires only the domains it uses, so its main-process bundle contains exactly that native code (importing presence never pulls in voice — asserted by a built-dist tree-shaking test).

Core `registerDiscord`/`exposeDiscord` stay the entry points: `registerDiscord` returns a `context` you pass to per-domain registrars (`registerLobbies(discord.context)`); `exposeDiscord(cb, ipc, [lobbiesSlice])` merges domain slices onto `window.discord`. Live `Lobby`/`Call` wrappers (which can't cross IPC) become serializable snapshots (`LobbySnapshot`/`CallSnapshot`) + id-keyed RPC re-resolved in the main process; every domain event stream broadcasts to renderer targets. Renderer typing is composable (`CoreBridge` + the domain bridge interfaces you exposed, or `FullBridge`).
