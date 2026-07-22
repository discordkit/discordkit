# @discordkit/native

Functional TypeScript bridge to the [Discord Social SDK][social-sdk] for native desktop runtimes — Electron, Tauri, and headless Node.

> [!WARNING]
>
> 🚧 Pre-1.0 and under active development. The API may change between minor versions. 🚧

It wraps the SDK's flat C ABI (`cdiscord.h`) over a [Koffi][koffi] FFI backend behind a seam that a future `node:ffi` implementation can slot into. The public surface is **free functions + a couple of live handle wrappers**, organized into tree-shakeable subpaths so importing one feature never pulls in another.

## 📦 Installation

```bash
npm install @discordkit/native
```

You must also supply the Discord Social SDK shared library yourself — it can't be redistributed. Download it from the Developer Portal and either pass `libraryPath` to `init`/`createClient`, set `DISCORD_SDK_PATH`, or place it at `./lib/discord_social_sdk`.

## 🔧 Quick start

```ts
import { init, subscribe } from "@discordkit/native";
import { authorize } from "@discordkit/native/auth";
import { setActivity } from "@discordkit/native/presence";

// Configure + activate the ambient client (load the lib, init the handle, pump).
// applicationId can come from DISCORD_APPLICATION_ID instead of being passed here.
const client = init({ applicationId: "1234567890" });

// React to connection status (a TC39 signal: "disconnected" → … → "ready").
using sub = subscribe(client.status, (status) => {
  console.log("Discord:", status);
});

// Run the OAuth2 PKCE flow (opens the browser), then set rich presence.
await authorize();
await setActivity({
  type: "playing",
  state: "In Match",
  details: "Rank: Diamond II"
});
```

The ambient singleton mirrors `@discordkit/client`'s `discord`: feature operations resolve it via `useClient()`, so you never thread a handle around. Use `createClient(...)` directly for multi-client or test scenarios; both are `using`-disposable.

## 🧩 Subpaths

Each feature is its own subpath (`@discordkit/native/<name>`) — the tree-shaking boundary.

| Subpath             | What it does                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.` (root)          | Lifecycle (`init`, `configure`, `shutdown`, `createClient`), `client.status` signal, `client.onLog`, `subscribe`.                                                                                                                                                                                         |
| `/presence`         | `setActivity` (object or builder), `clearActivity`. The activity supports the full rich-presence surface — details/state, assets, timestamps, party, buttons — plus `statusDisplayType` (`name`/`state`/`details`) to choose which field Discord surfaces in the user's status text.                      |
| `/auth`             | `authorize` (OAuth2 PKCE flow + connect) + the full session lifecycle — `startSession`/`resumeSession`/`endSession` over a pluggable `TokenStore` (so users authorize once and reconnect silently). Ships `fileStore` (encrypted file); adapters add an OS-vault backend. Throws typed `AuthorizeError`s. |
| `/users`            | `getCurrentUser`, `getUser` → plain `User` snapshots.                                                                                                                                                                                                                                                     |
| `/relationships`    | Friends/blocked/pending list + management (send/accept/reject/cancel friend requests, block/unblock).                                                                                                                                                                                                     |
| `/activity-invites` | Send/accept activity invites + join requests; subscribe to incoming invites. `acceptActivityInvite` resolves with the join secret.                                                                                                                                                                        |
| `/lobbies`          | `createOrJoinLobby` → a live **`Lobby`** (members, metadata, channel linking, per-lobby events); client-wide lobby events; guild/channel discovery.                                                                                                                                                       |
| `/messaging`        | Send/edit/delete messages (user + lobby), read messages + history, DM summaries, message events.                                                                                                                                                                                                          |
| `/voice`            | `startCall` → a live **`Call`** (mute/deaf/volume, audio mode, VAD, per-call events); client-wide audio (devices, volume, mute/deaf-all).                                                                                                                                                                 |

### Snapshots vs. live wrappers

Most SDK read-handles are read **once into a plain snapshot** object (`User`, `Relationship`, `Message`, `LobbyMember`, …) — simple, GC-friendly, no disposal burden. Two genuinely interactive, long-lived handles are surfaced as **live class wrappers** instead — `Lobby` and `Call` — whose getters re-read the SDK on each access and whose methods drive it:

```ts
import { createOrJoinLobby } from "@discordkit/native/lobbies";
import { startCall } from "@discordkit/native/voice";

using lobby = await createOrJoinLobby(secret);
console.log(lobby.members.map((m) => m.user?.username));
using off = lobby.onMemberAdded((id) => console.log("joined:", id));

using call = startCall(lobby.id);
using s = call.onStatusChanged((status) => {
  if (status === "connected") call.setSelfMute(false);
});
```

Both wrappers are `using`-disposable; disposing tears down their event subscriptions (it does **not** end the call or leave the lobby — use `endCall` / `lobby.leave()` for that).

The snapshot types are JSON-serializable as-is — **snowflake ids are branded `string`s** (matching `@discordkit/core` and Discord's wire convention, not `bigint`), and the live wrappers expose `toJSON()` — so a snapshot crosses any IPC/RPC bridge or `JSON.stringify` unchanged. This is what lets the Electron/Tauri adapters stay thin.

## 🔐 Session persistence

`@discordkit/native` owns the whole OAuth session lifecycle, so users authorize through the browser **once** and reconnect silently afterward:

```ts
import {
  startSession,
  resumeSession,
  endSession,
  fileStore
} from "@discordkit/native/auth";

const client = init({
  applicationId: "1234567890",
  tokenStore: fileStore("1234567890")
});

await resumeSession(); // on boot: silently reconnect from stored tokens
await startSession(); // on a connect button: stored tokens or browser auth
await endSession(); // on logout: end + clear the stored session
```

`TokenStore` is a `load`/`save`/`clear` seam; supply your own, or use the shipped `fileStore` (pure-Node AES-256-GCM, machine-derived key, SEA-safe). For an OS credential vault, the adapters ship a backend (e.g. `tauriKeyringStore` from `@discordkit/tauri/keyring`). Tokens refresh proactively via the SDK's expiration callback.

## 🔔 Events

Two shapes, both returning an unsubscribe that is also a `Disposable`:

- **Client-wide streams** — `onLobbyMemberAdded`, `onMessageCreated`, `onDeviceChange`, … fire for all entities and carry ids; re-fetch (`getLobby(id)`, `getMessage(id)`) for the full object.
- **Per-instance streams** — `lobby.onMemberAdded`, `call.onParticipantChanged`, … are scoped to that wrapper.

```ts
import { onMessageCreated, getMessage } from "@discordkit/native/messaging";

using sub = onMessageCreated((messageId) => {
  const message = getMessage(messageId);
  console.log(message?.author?.username, message?.content);
});
```

## ⚠️ Consent

Per Discord's SDK guidance, the action APIs (send a message, send/accept an invite, friend requests, …) must only be called **in response to an explicit user action** — never automatically.

## 🪪 License

MIT © [Drake Costa](https://saeris.gg)

[social-sdk]: https://discord.com/developers/docs/discord-social-sdk/overview
[koffi]: https://koffi.dev
