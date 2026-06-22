---
"@discordkit/electron": minor
---

Renderer conveniences + refinements for the Electron bridge:

- **`@discordkit/electron/signals`** — framework-agnostic renderer utilities (TC39 Signals via `signal-polyfill`, in a separate subpath so it's only bundled when used). Two shapes, matched to what the renderer↔main IPC split actually makes hard:
  - **Event-backed signals** (auto-updating): `statusSignal`, `devicesSignal`, `logSignal` (rolling buffer), `lobbyIdsSignal`, `lobbySignal(id)` (one lobby's live snapshot, re-fetched on its scoped events), and the derived `isConnectedSignal`. Plus a re-export of native's `subscribe`/`Subscription` from the koffi-free `@discordkit/native/subscribe` + `/subscription` subpaths (not the package root) as the framework glue, so the renderer bundle never pulls the FFI client.
  - **`asyncSignal(fn)`** — an async **resource** (`{ loading, data, error }` + `reload()`, with an out-of-order-reply guard) for the bridge's pull-only reads that have no event stream (`relationships.list`, `voice.getCalls`, `isSelfMuted`, …). Models the IPC request lifecycle honestly instead of faking reactivity.
- **Branded ids end to end**: bridge interfaces, main registrars, and snapshots now carry `@discordkit/native`'s branded snowflake types, so an id from one bridge call type-checks into another and mismatches are compile errors.
- **`Unsubscribe` type** for the `on*` subscriptions.
- **Full test coverage** across every domain (core, users, relationships, invites, messaging, voice) + the signals (44 tests).
- Added a package **README** (three-context model, per-domain composition, snapshots/RPC, signals + async resources, getting started).
