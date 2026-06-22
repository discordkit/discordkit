# @discordkit/tauri

Run the [Discord Social SDK][social-sdk] (via [`@discordkit/native`][native]) in a **Node sidecar** and reach it from a **Tauri webview** over a typed, bidirectional [kkrpc][kkrpc] bridge.

> [!WARNING]
>
> 🚧 Pre-1.0 and under active development. The API may change between minor versions. 🚧

The SDK's FFI is a Node-runtime binding, so it can't live in Tauri's Rust core — it runs in a **sidecar** process that Tauri's [shell plugin][shell] spawns. This package is the glue: a sidecar **host** that runs the SDK and speaks kkrpc over stdio, and a webview **client** that drives it as a typed object. The bridge is **composed per-domain** (mirroring `@discordkit/native`'s subpaths), so an app bundles only the native code for the features it actually wires — importing presence never pulls in voice.

There is **no Rust crate to install**: kkrpc rides the standard `tauri-plugin-shell`. You add one plugin line and merge a permissions snippet — see [Getting started](#-getting-started).

## 📦 Installation

```bash
npm install @discordkit/tauri @tauri-apps/api @tauri-apps/plugin-shell
```

`@tauri-apps/api` and `@tauri-apps/plugin-shell` are peer dependencies. You also supply the Discord Social SDK shared library yourself (it can't be redistributed) — see [`@discordkit/native`][native] for how the sidecar resolves it.

## 🧠 The two contexts

A Tauri app splits into the Rust-spawned **sidecar** (where the SDK runs) and the **webview** (your UI). This package has a subpath for each, plus a per-domain module under each:

| Context     | Subpath                               | What you call                                      |
| ----------- | ------------------------------------- | -------------------------------------------------- |
| **Sidecar** | `@discordkit/tauri/sidecar`           | `createSidecar([registrars], opts)`                |
|             | `@discordkit/tauri/sidecar/<domain>`  | `registerUsers`, `registerLobbies`, … (registrars) |
| **Webview** | `@discordkit/tauri/client`            | `createClient([slices])` → the typed bridge        |
|             | `@discordkit/tauri/client/<domain>`   | `usersSlice`, `lobbiesSlice`, … (slice factories)  |
|             | `@discordkit/tauri/renderer`          | `CoreBridge` / `FullBridge` typing                 |
|             | `@discordkit/tauri/renderer/<domain>` | per-domain bridge + value types                    |
|             | `@discordkit/tauri/signals`           | framework-agnostic reactive helpers (optional)     |

The **core** (`createSidecar` / `createClient`) covers presence, auth, status, and log — the baseline every integration uses. Feature domains (`users`, …) are **opt-in**: you only bundle a domain's native code if you compose its registrar (sidecar) and slice (client).

## 🔧 Getting started

### 1. The sidecar entry (your app owns + builds it)

Create `discord.sidecar.ts`. Composing registrars here is what keeps the built binary tree-shaken — only the domains you list end up in it:

```ts
import { createSidecar } from "@discordkit/tauri/sidecar";
import { registerUsers } from "@discordkit/tauri/sidecar/users";

createSidecar([registerUsers], { applicationId: "1234567890" });
// presence/auth/status/log are core (always present); add feature domains above
```

Build it to a binary and register it as a Tauri sidecar in `tauri.conf.json`:

```jsonc
// tauri.conf.json
{ "bundle": { "externalBin": ["binaries/discord-sidecar"] } }
```

> stdout carries the RPC protocol — your sidecar code must not `console.log`. Diagnostics go to stderr (the default), or route them via `createSidecar`'s `onError`.

### 2. Permissions (merge the scaffolded snippet)

kkrpc talks to the sidecar through `tauri-plugin-shell`, which needs permission to spawn it. Register the plugin in your `src-tauri`:

```rust
// src-tauri/src/lib.rs
tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    // …
```

…and merge the shell permissions scoped to the sidecar into your capability. This package ships them at `@discordkit/tauri/tauri/capabilities.json` — copy them into `src-tauri/capabilities/` (or merge into your existing capability):

```jsonc
// the scoped permissions (see the shipped capabilities.json)
{
  "identifier": "shell:allow-execute",
  "allow": [{ "name": "binaries/discord-sidecar", "sidecar": true }]
}
// + shell:allow-spawn (same scope), shell:allow-kill, shell:allow-stdin-write
```

### 3. The webview

Compose the matching client slices; `createClient` spawns the sidecar and returns the typed bridge:

```ts
import { createClient } from "@discordkit/tauri/client";
import { usersSlice } from "@discordkit/tauri/client/users";

const discord = await createClient([usersSlice]);

await discord.connect(); // OAuth2 + connect
await discord.setActivity({ type: "playing", state: "In Match" });
const me = await discord.users.getCurrent();

// on teardown:
await discord.close(); // closes the channel + stops the sidecar
```

The bridge type is inferred from the slices you compose. To name it explicitly, combine the pieces from `@discordkit/tauri/renderer`:

```ts
import type { CoreBridge } from "@discordkit/tauri/renderer";
import type { UsersBridge } from "@discordkit/tauri/renderer/users";

type Discord = CoreBridge & { users: UsersBridge };
```

## 🔐 Session persistence (`@discordkit/tauri/keyring`)

Session persistence is native-owned ([`@discordkit/native`][native]): `connect` resolves to a silent reconnect when a `tokenStore` is configured, `logout` ends the session, and `createSidecar` auto-resumes on boot — the integrator just supplies a `TokenStore`. For production, this package ships an **OS-vault** backend (Windows Credential Manager / macOS Keychain / Linux Secret Service) via [`tauri-plugin-keyring`][keyring]:

```ts
// sidecar entry — store tokens in the OS vault
import { tauriKeyringStore } from "@discordkit/tauri/keyring";
createSidecar([registerUsers], {
  applicationId: "1234567890",
  tokenStore: tauriKeyringStore()
});

// webview — expose the vault to the sidecar (only the shell can reach it)
import { keyringRelay } from "@discordkit/tauri/keyring";
const discord = await createClient([usersSlice], {
  expose: keyringRelay("my-app")
});
```

The sidecar can't touch the OS vault directly, so `tauriKeyringStore`'s reads/writes relay through the webview's `keyringRelay`. Setup adds the `tauri-plugin-keyring` crate to `src-tauri`, the `tauri-plugin-keyring-api` peer dep, and the `keyring:allow-*-password` capabilities. (Don't want a vault? Use native's addon-free `fileStore` — no extra setup.)

## 🪞 What crosses the bridge (snapshots + id-keyed RPC)

`@discordkit/native` returns **live** `Lobby` / `Call` objects (native handles + methods) — those can't cross the process boundary. Over the bridge the webview instead gets serializable **snapshots** (`LobbySnapshot`, `CallSnapshot`) from reads, and drives those entities with **id-keyed RPC** — identical to the [`@discordkit/electron`][electron] model.

Ids are **branded snowflakes** (`UserId`, `LobbyId`, `ChannelId`, …) inherited from `@discordkit/native` — an id returned by one call type-checks straight into another that wants the same kind, and the compiler rejects mixing them up. They're plain **strings** at runtime (Discord's wire convention, matching the REST client), so they serialize over kkrpc's JSON transport unchanged — this adapter does **no** id conversion. The snapshots come from native's `Lobby.toJSON()` / `Call.toJSON()`, so the adapter never hand-writes serialization.

## 🔔 Events

Every `on*` method returns an `Unsubscribe`. Events ride the same bidirectional kkrpc channel as calls (no separate Tauri `emit`/`listen` wiring needed). Client-wide streams carry ids; re-fetch for the full object:

```ts
const off = discord.messages.onCreated((messageId) => {
  void discord.messages.get(messageId).then(render);
});
// later: off();
```

## ⚡ Renderer conveniences (`@discordkit/tauri/signals`)

The webview↔sidecar split makes two things awkward that a plain bridge call doesn't solve: turning the bridge's **push events** into state you can read synchronously, and managing the **async request lifecycle** of a pull read. This subpath ships both, framework-agnostic, on [TC39 Signals][signals] — read a current value with `.get()` and adapt to any framework. It's a separate subpath, so `signal-polyfill` is only bundled if you use it. (Same surface as the [`@discordkit/electron`][electron] signals — only the transport beneath differs.)

### Event-backed signals (auto-updating)

For bridge state that pushes events, these seed from the getter and stay live:

```ts
import {
  statusSignal, // Signal.State<Status>        — getStatus + onStatus
  devicesSignal, // input + output device lists — get*Devices + onDeviceChange
  logSignal, // rolling buffer of log lines     — onLog (capped, default 100)
  lobbyIdsSignal, // the lobbies you're in      — getIds + onCreated/onDeleted
  lobbySignal, // ONE lobby's live snapshot     — get(id) + member events for id
  isConnectedSignal, // Signal.Computed<boolean> — derived: status === "ready"
  subscribe
} from "@discordkit/tauri/signals";

const status = statusSignal(discord);
const ready = isConnectedSignal(status);
const lobby = lobbySignal(discord.lobbies, lobbyId);

using off = subscribe(lobby, (snap) => renderMembers(snap?.members ?? []));

// React:  useSyncExternalStore((cb) => subscribe(status, cb), () => status.get())
// Vue/Solid: read status.get() inside a reactive scope
// Svelte: readable(status.get(), (set) => subscribe(status, set))
```

### Async resources (for pull-only reads)

Some bridge reads have **no event stream** to drive a reactive signal — `relationships.list`, `voice.getCalls`, `messages.getUserMessages`, `isSelfMuted`, … For those, `asyncSignal` models the actual challenge: the request lifecycle. It runs the read, exposes `{ loading, data, error }` reactively, guards against out-of-order replies, and offers `reload()`:

```ts
import { asyncSignal, subscribe } from "@discordkit/tauri/signals";

const friends = asyncSignal(() => discord.relationships.list());
using off = subscribe(friends, ({ loading, data, error }) =>
  render(loading, data, error)
);

// refresh after a mutation:
await discord.relationships.block(userId);
await friends.reload();
```

> Why not a "refreshable signal" for these too? That would dress a static read up as auto-reactive when nothing actually pushes. `asyncSignal` is honest about it being request state — use the event-backed signals where the bridge genuinely pushes, and `asyncSignal` where it doesn't.

## ⚠️ Consent

Per Discord's SDK guidance, action APIs (send a message, send/accept an invite, friend requests, …) must only be called **in response to an explicit user action** — never automatically.

## 🪪 License

MIT © [Drake Costa](https://saeris.gg)

[social-sdk]: https://discord.com/developers/docs/discord-social-sdk/overview
[native]: https://www.npmjs.com/package/@discordkit/native
[electron]: https://www.npmjs.com/package/@discordkit/electron
[kkrpc]: https://github.com/kunkunsh/kkrpc
[shell]: https://v2.tauri.app/plugin/shell/
[signals]: https://github.com/tc39/proposal-signals
[keyring]: https://github.com/HuakunShen/tauri-plugin-keyring
