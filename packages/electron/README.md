# @discordkit/electron

Run the [Discord Social SDK][social-sdk] (via [`@discordkit/native`][native]) in Electron's **main process** and reach it from the **renderer** over a typed, sandboxed IPC bridge.

> [!WARNING]
>
> 🚧 Pre-1.0 and under active development. The API may change between minor versions. 🚧

The SDK is a native library — it can only live in the main process. This package is the glue: it wires the SDK to IPC in the main process and exposes a typed `window.discord` in the renderer, so your UI drives Discord without ever touching FFI. The bridge is **composed per-domain** (mirroring `@discordkit/native`'s subpaths), so an app bundles only the native code for the features it actually wires — importing presence never pulls in voice.

## 📦 Installation

```bash
npm install @discordkit/electron
```

`electron` is a peer dependency. You also supply the Discord Social SDK shared library yourself (it can't be redistributed) — see [`@discordkit/native`][native] for how `init` resolves it.

## 🧠 The three contexts

An Electron app has three JS contexts; this package has a subpath for each, plus a per-domain module under each:

| Context          | Subpath                                  | What you call                                           |
| ---------------- | ---------------------------------------- | ------------------------------------------------------- |
| **Main process** | `@discordkit/electron/main`              | `registerDiscord(ipcMain, opts)` → returns a `context`  |
|                  | `@discordkit/electron/main/<domain>`     | `registerUsers(context)`, `registerLobbies(context)`, … |
| **Preload**      | `@discordkit/electron/preload`           | `exposeDiscord(contextBridge, ipcRenderer, [slices])`   |
|                  | `@discordkit/electron/preload/<domain>`  | `usersSlice`, `lobbiesSlice`, … (slice factories)       |
| **Renderer**     | `@discordkit/electron/renderer`          | `CoreBridge` / `FullBridge` typing for `window.discord` |
|                  | `@discordkit/electron/renderer/<domain>` | per-domain bridge + value types                         |
|                  | `@discordkit/electron/signals`           | framework-agnostic reactive helpers (optional)          |

The **core** (`registerDiscord` / `exposeDiscord`) covers presence, auth, status, and log — the baseline every integration uses. Feature domains (`users`, `relationships`, `invites`, `lobbies`, `messaging`, `voice`) are **opt-in**: you only bundle a domain's native code if you wire its registrar.

## 🔧 Getting started

### 1. Main process (after `app.whenReady()`)

```ts
import { ipcMain } from "electron";
import { registerDiscord } from "@discordkit/electron/main";
import { registerLobbies } from "@discordkit/electron/main/lobbies";

const discord = registerDiscord(ipcMain, {
  applicationId: 123n,
  targets: [mainWindow.webContents] // who receives status/log/events
});

// Opt into the domains you use — each imports ONLY its native subpath:
registerLobbies(discord.context);
// (skip registerVoice/registerMessaging/… and none of that native code is bundled)

// On shutdown:
app.on("will-quit", () => discord.dispose());
```

### 2. Preload (sandboxed → must be bundled)

```ts
import { contextBridge, ipcRenderer } from "electron";
import { exposeDiscord } from "@discordkit/electron/preload";
import { lobbiesSlice } from "@discordkit/electron/preload/lobbies";

// The core surface is always exposed; pass slices for the domains you wired.
exposeDiscord(contextBridge, ipcRenderer, [lobbiesSlice]);
// → window.discord.connect(...), window.discord.setActivity(...),
//   window.discord.lobbies.createOrJoin(...)
```

### 3. Renderer

Declare the shape of `window.discord` to match exactly what your preload exposed:

```ts
// global.d.ts
import type { CoreBridge } from "@discordkit/electron/renderer";
import type { LobbiesBridge } from "@discordkit/electron/renderer/lobbies";

declare global {
  interface Window {
    discord: CoreBridge & { lobbies: LobbiesBridge };
  }
}
```

```tsx
await window.discord.connect(); // OAuth2 + connect
await window.discord.setActivity({ type: "playing", state: "In Match" });
using lobby = await window.discord.lobbies.createOrJoin(secret); // a snapshot
```

> Exposed everything? Use `FullBridge` from `@discordkit/electron/renderer` instead of composing the pieces.

## 🪞 What crosses IPC (snapshots + id-keyed RPC)

`@discordkit/native` returns **live** `Lobby` / `Call` objects (native handles + methods) — those can't cross the process boundary. Over IPC the renderer instead gets serializable **snapshots** (`LobbySnapshot`, `CallSnapshot`) from reads, and drives those entities with **id-keyed RPC**:

```ts
const lobby = await window.discord.lobbies.get(lobbyId); // LobbySnapshot
await window.discord.lobbies.leave(lobby.id); // act on it by id
await window.discord.voice.setSelfMute(channelId, true);
```

Ids are **branded snowflakes** (`UserId`, `LobbyId`, `ChannelId`, …) inherited from `@discordkit/native` — an id returned by one call type-checks straight into another that wants the same kind, and the compiler rejects mixing them up. They're plain `bigint` at runtime and cross IPC intact.

## 🔔 Events

Every `on*` method returns an `Unsubscribe`. Client-wide streams carry ids; re-fetch for the full object.

```ts
const off = window.discord.messages.onCreated((messageId) => {
  void window.discord.messages.get(messageId).then(render);
});
// later: off();
```

## ⚡ Renderer conveniences (`@discordkit/electron/signals`)

The renderer↔main split makes two things awkward that a plain bridge call doesn't solve: turning the bridge's **push events** into state you can read synchronously, and managing the **async request lifecycle** of an IPC read. This subpath ships both, framework-agnostic, on [TC39 Signals][signals] — read a current value with `.get()` and adapt to any framework. It's a separate subpath, so `signal-polyfill` is only bundled if you use it.

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
} from "@discordkit/electron/signals";

const status = statusSignal(window.discord);
const ready = isConnectedSignal(status);
const lobby = lobbySignal(window.discord.lobbies, lobbyId);

using off = subscribe(lobby, (snap) => renderMembers(snap?.members ?? []));

// React:  useSyncExternalStore((cb) => subscribe(status, cb), () => status.get())
// Vue/Solid: read status.get() inside a reactive scope
// Svelte: readable(status.get(), (set) => subscribe(status, set))
```

### Async resources (for pull-only reads)

Some bridge reads have **no event stream** to drive a reactive signal — `relationships.list`, `voice.getCalls`, `messages.getUserMessages`, `isSelfMuted`, … For those, `asyncSignal` models the actual IPC challenge: the request lifecycle. It runs the read, exposes `{ loading, data, error }` reactively, guards against out-of-order replies, and offers `reload()`:

```ts
import { asyncSignal, subscribe } from "@discordkit/electron/signals";

const friends = asyncSignal(() => window.discord.relationships.list());
using off = subscribe(friends, ({ loading, data, error }) =>
  render(loading, data, error)
);

// refresh after a mutation:
await window.discord.relationships.block(userId);
await friends.reload();
```

> Why not a "refreshable signal" for these too? That would dress a static read up as auto-reactive when nothing actually pushes. `asyncSignal` is honest about it being request state — use the event-backed signals where the bridge genuinely pushes, and `asyncSignal` where it doesn't.

## ⚠️ Consent

Per Discord's SDK guidance, action APIs (send a message, send/accept an invite, friend requests, …) must only be called **in response to an explicit user action** — never automatically.

## 🪪 License

MIT © [Drake Costa](https://saeris.gg)

[social-sdk]: https://discord.com/developers/docs/discord-social-sdk/overview
[native]: https://www.npmjs.com/package/@discordkit/native
[signals]: https://github.com/tc39/proposal-signals
