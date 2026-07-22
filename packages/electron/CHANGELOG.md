# Changelog


## 0.1.1
<sub>2026-07-22</sub>

- *(patch)* Updated dependency `@discordkit/native` v0.2.0

## 0.1.0
<sub>2026-06-22</sub>

- [#60](https://github.com/discordkit/discordkit/pull/60)  *(minor)* Thanks [@Saeris](https://github.com/Saeris)!
  Added @discordkit/electron: an Electron adapter that runs @discordkit/native (Discord Social SDK) in the main process and exposes it to the renderer over a typed, sandboxed contextBridge IPC bridge (registerDiscord / exposeDiscord / window.discord). Ships rich presence + auth wiring.
- [#60](https://github.com/discordkit/discordkit/pull/60)  *(minor)* Thanks [@Saeris](https://github.com/Saeris)!
  Expanded the Electron bridge from presence + auth + status/log to a full mirror of every `@discordkit/native` domain (users, relationships, activity-invites, lobbies, messaging, voice) — **composed per-domain so it preserves tree-shaking**. Each domain is its own subpath on all three sides (`@discordkit/electron/{main,preload,renderer}/<domain>`); an app wires only the domains it uses, so its main-process bundle contains exactly that native code (importing presence never pulls in voice — asserted by a built-dist tree-shaking test).

  Core `registerDiscord`/`exposeDiscord` stay the entry points: `registerDiscord` returns a `context` you pass to per-domain registrars (`registerLobbies(discord.context)`); `exposeDiscord(cb, ipc, [lobbiesSlice])` merges domain slices onto `window.discord`. Live `Lobby`/`Call` wrappers (which can't cross IPC) become serializable snapshots (`LobbySnapshot`/`CallSnapshot`) + id-keyed RPC re-resolved in the main process; every domain event stream broadcasts to renderer targets. Renderer typing is composable (`CoreBridge` + the domain bridge interfaces you exposed, or `FullBridge`).
- [#60](https://github.com/discordkit/discordkit/pull/60)  *(minor)* Thanks [@Saeris](https://github.com/Saeris)!
  Renderer conveniences + refinements for the Electron bridge:

  - **`@discordkit/electron/signals`** — framework-agnostic renderer utilities (TC39 Signals via `signal-polyfill`, in a separate subpath so it's only bundled when used). Two shapes, matched to what the renderer↔main IPC split actually makes hard:
    - **Event-backed signals** (auto-updating): `statusSignal`, `devicesSignal`, `logSignal` (rolling buffer), `lobbyIdsSignal`, `lobbySignal(id)` (one lobby's live snapshot, re-fetched on its scoped events), and the derived `isConnectedSignal`. Plus a re-export of native's `subscribe`/`Subscription` from the koffi-free `@discordkit/native/subscribe` + `/subscription` subpaths (not the package root) as the framework glue, so the renderer bundle never pulls the FFI client.
    - **`asyncSignal(fn)`** — an async **resource** (`{ loading, data, error }` + `reload()`, with an out-of-order-reply guard) for the bridge's pull-only reads that have no event stream (`relationships.list`, `voice.getCalls`, `isSelfMuted`, …). Models the IPC request lifecycle honestly instead of faking reactivity.
  - **Branded ids end to end**: bridge interfaces, main registrars, and snapshots now carry `@discordkit/native`'s branded snowflake types, so an id from one bridge call type-checks into another and mismatches are compile errors.
  - **`Unsubscribe` type** for the `on*` subscriptions.
  - **Full test coverage** across every domain (core, users, relationships, invites, messaging, voice) + the signals (44 tests).
  - Added a package **README** (three-context model, per-domain composition, snapshots/RPC, signals + async resources, getting started).
- [#60](https://github.com/discordkit/discordkit/pull/60)  *(patch)* Thanks [@Saeris](https://github.com/Saeris)!
  The live `Lobby` and `Call` wrappers gain a `toJSON()` method (and exported `LobbySnapshot` / `CallSnapshot` types) that serializes the wrapper's live getters into a plain, transport-ready object — so `JSON.stringify(lobby)` works and any process/transport bridge can serialize a wrapper identically. The Tauri and Electron adapters now call `lobby.toJSON()` / `call.toJSON()` and import the snapshot types from native instead of hand-writing the serialization + re-declaring the types per adapter. Combined with snowflakes now being strings, the Tauri adapter drops its entire bigint apparatus: the `Wire<T>` type rewriting, the per-domain inbound id coercion, AND the `serialize`/`bigint.ts` helper are all gone — every payload is JSON-serializable as-is. A message's `sentTimestamp`/`editedTimestamp` are now `number` (epoch ms fit losslessly in a JS number) instead of `bigint`, so no payload carries a bigint and ids + timestamps cross the kkrpc bridge unchanged.
