# Spec — Discord Social SDK native bridge for Electron & Tauri

> Status: **Draft for review** · Owner: Drake Costa · Date: 2026-06-12
> Scope of v0: **Rich Presence + OAuth2 auth**, on **Electron and Tauri (desktop)**.

## 1. Goal

Let developers building desktop apps/games on the **web platform** (Electron, Tauri)
use Discord's **Social SDK** — which Discord ships only as a native C/C++ library —
from **TypeScript** (and, for Tauri, also from **Rust**), without writing any C/C++
themselves. The first milestone is **Rich Presence** (show "Playing <game>" with
state/details on a user's Discord profile), gated behind the SDK's OAuth2 login flow.

Non-goals for v0: friends/relationships, voice, lobbies, DMs, game invites, provisional
accounts, console platforms, mobile. The architecture must not _preclude_ these, but we
bind them incrementally only after the core pipeline is proven (CLAUDE.md Rule 2).

## 2. Key findings that shaped this design

These were established from the saved docs (`social-sdk-docs/`, gitignored) and research.
They are the load-bearing facts; if any turns out wrong the plan changes.

1. **The SDK is a native shared library**, distributed per-application and **license-restricted**:
   the [Social SDK Terms](https://support-dev.discord.com/hc/en-us/articles/30225844245271-Discord-Social-SDK-Terms)
   forbid redistributing the SDK separately — it may only **ship bundled inside the consumer's app**.
   → **We cannot publish the SDK binary to npm/crates.io, nor host prebuilt copies.** The
   common "prebuilds on GitHub Releases" pattern (better-sqlite3 et al.) is unavailable.

2. **Binaries are obtained manually** from the authenticated Developer Portal
   (`Discord Social SDK > Downloads`), as a versioned zip
   (`DiscordSocialSdk-*-X.X.X.zip`). **No stable/scriptable download URL exists** — every
   community wrapper (Unity sample, Java/JNA, Godot GDExtension) instructs a manual download.
   → A fully-automated "fetch the SDK for you" CLI is **not reliable**. Our tooling can
   _scaffold and wire up_ a developer-supplied copy; it cannot download on their behalf.

3. **There is a flat C ABI — verified first-hand against SDK 1.9.16441's `include/cdiscord.h`.**
   `cdiscord.h` (1,906 lines, header comment: _"Generated with <3 by Discord.Sdk.Derive"_) is
   the real boundary; `discordpp.h` (12,499 lines) is a header-only C++ wrapper over it.
   → **We bind the C ABI directly from managed runtimes — no C++ compilation required.**
   Concrete ABI facts that fully determine the binding (see §2.1):
   - All functions are `extern "C"`, `__declspec(dllexport)`/`visibility("default")`.
   - **Handles are single-pointer opaque structs:** `struct Discord_Client { void* opaque; }`,
     `struct Discord_Activity { void* opaque; }`. You allocate the pointer-sized struct, call
     `Discord_<T>_Init(&h)` to populate it, and `Discord_<T>_Drop(&h)` to free. We never need
     the SDK's internal struct sizes — we only ever hold pointers.
   - **Strings cross as `Discord_String { uint8_t* ptr; size_t size }`** (UTF-8, length-prefixed,
     **not** null-terminated). Returned strings/`Discord_Properties` must be released via the
     SDK's `Discord_Free`/`Discord_FreeProperties`. Some setters take `Discord_String*`
     (nullable/optional), e.g. `Discord_Activity_SetState/SetDetails`.
   - **Collections cross as spans** `{ T* ptr; size_t size }` (e.g. `Discord_ActivityButtonSpan`).
   - **Enums are pinned to int32** via a `_forceint = 0x7FFFFFFF` member → marshal as `int32`.
   - **Every async fn takes a callback triple** `(callback, callback__userDataFree, void* callback__userData)`.
     The SDK calls `userDataFree(userData)` when done — a prescribed, leak-free closure-lifetime
     contract. Callbacks are either **one-shot** (`UpdateRichPresenceCallback`, auth callbacks —
     dispose after firing) or **persistent** (`OnStatusChanged`, `LogCallback` — keep alive until
     `Discord_Client_Drop`/`Discord_ResetCallbacks`).
   - Prior art confirming the ABI: Discord ships `NativeMethods.cs` (C# P/Invoke); the Java
     wrapper uses **JNA**; both require a flat C ABI.

4. **The runtime model is "register callbacks + manually pump".** You create a `Client`,
   register a status-changed callback and a log callback, run the OAuth2 PKCE flow
   (`Authorize` → `GetToken` → `UpdateToken` → `Connect`), then call the free function
   `Discord_RunCallbacks()` (`discordpp::RunCallbacks()`) on a tick to drain events and fire
   callbacks. Most features only work once status reaches `Ready`. Rich presence is
   `UpdateRichPresence(Activity, cb)` with `Activity` setters (`SetType/SetState/SetDetails`).

5. **Desktop platform matrix** (the only tier we target for v0):
   Windows x64 + ARM64, macOS x64 + ARM64, Linux (glibc 2.31+, _experimental_). Runtime
   files: `discord_partner_sdk.dll` / `libdiscord_partner_sdk.{so,dylib}`, expected next to
   the executable (or on `LD_LIBRARY_PATH` / rpath `$ORIGIN` / `@executable_path`).
   **One download is multi-platform:** SDK 1.9.16441's archive bundles Windows (`bin|lib/{debug,release}`,
   x64 at top level + `arm64/` nested), macOS (`.dylib` + `.xcframework`), Linux (`.so`), and
   Android (`.aar`) under one tree, plus `debug` and `release` variants and a Krisp voice-NC
   companion lib (`discord_krisp.*` + `.kef` models — irrelevant to presence v0).

### 2.1 Verified v0 function map (from `cdiscord.h` 1.9.16441)

The exact symbols the v0 client binds — all present and confirmed:

```c
/* lifecycle */            Discord_Client_Init(self) / _InitWithOptions / _Drop(self)
/* global pump */          Discord_RunCallbacks() / Discord_SetFreeThreaded() / Discord_ResetCallbacks()
/* persistent callbacks */ Discord_Client_SetStatusChangedCallback(self, OnStatusChanged, freeFn, userData)
                           Discord_Client_AddLogCallback(self, LogCallback, severity, freeFn, userData)
/* auth (PKCE) */          Discord_Client_GetDefaultPresenceScopes(&out)
                           Discord_Client_CreateAuthorizationCodeVerifier(...)
                           Discord_Client_Authorize(self, args, cb, freeFn, userData)
                           Discord_Client_GetToken(self, ..., TokenExchangeCallback, freeFn, userData)
                           Discord_Client_UpdateToken(self, tokenType, token, cb, freeFn, userData)
/* connect */              Discord_Client_Connect(self) / _Disconnect(self)
/* presence */             Discord_Activity_Init(&a) / _SetType / _SetState / _SetDetails / _SetName / _Drop
                           Discord_Client_UpdateRichPresence(self, &activity, cb, freeFn, userData)
/* helpers */              Discord_Client_StatusToString / _ErrorToString / _GetVersion{Major,Minor,Patch}
```

Callback signatures of note: `OnStatusChanged(status, error, int32 errorDetail, userData)`;
`LogCallback(Discord_String message, severity, userData)`;
`UpdateRichPresenceCallback(Discord_ClientResult* result, userData)`;
`TokenExchangeCallback(result, accessToken, refreshToken, tokenType, int32 expiresIn, scopes, userData)`.

## 3. Binding strategy (the central decision)

Because the boundary is a **flat C ABI**, we bind it twice from the same header, with
**no hand-written C/C++**, and present **one identical TypeScript API** on both runtimes.
Per the user's direction, Tauri is exposed on **both** its Rust core _and_ a Node sidecar.

```
                    cdiscord.h  (Discord's C ABI — the single source of truth)
                         │
        ┌────────────────┼─────────────────────────┐
        │                │                          │
   Koffi FFI (TS)   Koffi FFI (TS)            bindgen (Rust)
        │                │                          │
   Electron main     Node sidecar              tauri-plugin (Rust)
        │                │                          │
        └──────── identical TS surface ────────┘   └── Rust + JS bindings
```

- **Node path (Electron + Tauri-sidecar): FFI behind a backend seam.** Binding logic
  talks only to a tiny internal `FfiBackend` interface (`load`/`func`/`defineCallback`/
  `registerCallback`/`allocPointerStruct`/`decodeString`), never importing an FFI lib
  directly. Two interchangeable implementations:
  - **[Koffi](https://koffi.dev) — ships now (default).** Modern Node FFI, no node-gyp,
    no per-Node-version prebuilds. Declares the C functions/structs in TS and `dlopen`s
    the developer's SDK library.
  - **`node:ffi` — long-term target (Node 26+), drop-in later.** Built into Node, no dep.
    Currently **experimental + flag-gated** (`--experimental-ffi`, `--allow-ffi`) and has
    **no declarative structs** (read by offset via `getUint64`/`toBuffer`), so not the
    shippable default yet — but the seam makes it a single-file swap when it stabilizes.
    Both share the threading property the manual-pump model needs: we call
    `Discord_RunCallbacks` from a main-thread timer, so the SDK invokes our callbacks
    **synchronously on the main thread inside that pump call** — no thread-safety hazard, no
    TSFN, no C++. (Both libs' docs require callbacks fire on their creating thread; the pump
    satisfies this by construction.)
  - **Bun (`bun:ffi`) and Deno (`Deno.dlopen`) — also one-file backends if ever wanted.**
    Not supported now (no consumer; out of scope), but assessed: every seam method maps
    cleanly (`JSCallback`/`UnsafeCallback` for callbacks, both `.close()` to unregister,
    `CString`/`UnsafePointerView` for strings), and the pump/threading model is
    runtime-agnostic by construction. **The one shared caveat across node:ffi/Bun/Deno:**
    they take a *structured descriptor* (`{ parameters, result }`), not Koffi's C-signature
    *string*. So the first non-Koffi backend pays a one-time cost — either a ~30-line
    C-decl-string→descriptor parser (shared by all three, keeps feature code's readable
    signatures) or flipping the seam's `func` to accept a descriptor. Contained to that one
    method; the rest of the seam is unaffected. This is the seam's single load-bearing
    assumption, recorded here so it isn't rediscovered later.
- **Tauri Rust path: `bindgen`** generates Rust FFI from `cdiscord.h` at build time
  (targets C, which the ABI is), wrapped in a small safe Rust layer and exposed as a
  `tauri-plugin` with JS bindings. No C++ shim needed (bindgen can't read C++/STL, but the
  C ABI sidesteps that — this is _why_ finding `cdiscord.h` matters).

**Why not a C++ N-API addon?** It would force node-gyp builds, per-target prebuilds we
must host (and an `electron-rebuild` story), and a C++ codebase the owner can't easily
maintain. The C ABI removes the only reason to write C++. We keep N-API as a documented
fallback **only** if Koffi proves unable to express some struct/callback shape.

**Why a sidecar for Tauri at all, if there's a Rust plugin?** Flexibility (user's
explicit ask): some teams prefer to keep all Discord logic in one TS codebase shared with
their web/Electron build; the sidecar lets them. Others want zero extra processes and
native Rust — they use the plugin. Both bind the same ABI and expose the same TS types.

## 4. Audience & design principles

### Who we're really building for

Discord scopes the Social SDK to "game developers" — that's their _commercial_ target, not
a technical boundary. The real boundary is **"a native desktop process that can load a
shared library and talk to the local Discord client + social graph."** Any desktop app
where presence/identity/social adds value is a candidate. Framing `@discordkit/native` that
way (not as "a game SDK") widens the audience at near-zero extra cost _if_ the core is
runtime-agnostic and tree-shakeable:

1. **Web-tech games (core).** Electron/Tauri games. Want: presence, invites, later
   voice/lobbies; _not_ a C++ toolchain.
2. **Ambient-presence in productivity/creative tools** (editors, music, design — "Working
   on X in <App>"). Today they hand-roll the fragile legacy `discord-rpc` pipe; the Social
   SDK is the supported replacement. Want: **minimal footprint** (presence is a tiny
   feature in a big app) → our top tree-shaking beneficiary.
3. **Companion/second-screen apps** (overlays, launchers, mod managers, stat trackers).
   Want: relationships, voice state, lobbies — and to import only the slice they use.
4. **Account-linking / identity bridges** ("Sign in with Discord" + local-client trust,
   provisional accounts). Want: just the auth/identity surface.
5. **Headless CLI / agent / automation tooling** (set presence or read social state from a
   bare Node process — no Electron, no Tauri, no browser). Want: **zero UI-framework
   assumptions** → forces the clean runtime-agnostic core we want anyway.
6. **Other shells** (Neutralino, Wails, NW.js, bare Node + native windowing). Want: the
   binding not to assume a host.

### Design principles (these are binding constraints, not preferences)

- **Runtime-agnostic keystone.** `@discordkit/native` is pure Node — no Electron/Tauri/React
  import. Adapters sit on top. (Serves 5 & 6; keeps the graph minimal for everyone.)
- **Functional + tree-shakeable, matching the REST client.** No god-object class. The model
  mirrors `@discordkit/core`'s **module-singleton + thin indirection**: REST exports
  `const discord = new DiscordSession()` and funnels every fetcher through `request()`,
  which reads the singleton — so fetchers depend on `request`, never on the session. We do
  the same: an ambient singleton client, and feature operations that read it via an internal
  accessor. The "core state" (REST: the auth token) is here `{ handle, pump, status }`.
- **Ambient singleton, no handle-threading (the React-Context / Signals analogy).** Ops take
  **no handle argument** — `setActivity({...})` uses the ambient client. This is the user's
  explicit preference over `setActivity(handle, {...})` prop-drilling.
- **Per-feature subpath modules with lazy FFI binding.** Each operation lives in its feature
  module (`/auth`, `/presence`, …) and is the _only_ thing that declares its C functions
  (e.g. `setActivity` is the only declarer of `Discord_Client_UpdateRichPresence`). The
  singleton holds only generic state and does **not** import feature bindings. → importing
  `setActivity` pulls in the accessor + presence binding and nothing else. _This_ is what
  makes tree-shaking real despite per-function FFI declaration cost. (To be proven with a
  bundle test in P1.)
- **Observable state = TC39 Signals (via `signal-polyfill`); commands stay plain functions.**
  Two distinct categories, kept honest:
  - **Observable producer-state** (`status`, possibly a future `currentActivity` mirror) is a
    real **`Signal.State`** from [`signal-polyfill`](https://www.npmjs.com/package/signal-polyfill)
    (`0.2.2`, Apache-2.0), driven internally from the SDK's `OnStatusChanged`. So
    `status.get()` is always-current (`Disconnected|…|Ready`; a late reader still gets the
    value — the `useState` property), and ecosystem consumers can build `Signal.Computed(() =>
status.get() === "Ready")` directly off it. We **wrap the spec's `Signal.subtle.Watcher`
    once** to also expose an ergonomic `status.subscribe(cb)` (the proposal omits a
    `.subscribe`); apps get the simple path, power users get the raw `Signal.State`.
    No proxy-setters — those suit deep object stores (Valtio/Jotai), not scalar signals; the
    proposal's explicit `.get()`/`.set()` is the right primitive for single values.
  - **Commands** (`setActivity`, `clearActivity`, `authorize`) are **plain functions**, not
    signal writes — they map to imperative SDK calls (`UpdateRichPresence` is _replace_, not
    patch). `setActivity` takes a plain object and/or a builder callback over a plain (non-
    proxied) object: `setActivity(a => { a.type = "playing"; a.button("Join", url); })`. **No
    Immer** — draft/read-modify-write semantics would mislead (the ABI replaces) and its
    non-tree-shakeable engine fights the footprint goal. (Draft/diff patterns are reserved
    for genuinely stateful, patch-style resources like lobby metadata, _if_ we reach them —
    scoped to that feature module so the cost is opt-in.)
  - `onLog` stays a subscribe-only event stream (no single "current" value → not a signal).
  - **Footprint containment:** `signal-polyfill` lives in **core** (the `status` signal is
    fundamental, loads when anyone uses the client) but must **not** leak into per-feature
    subpaths — `setActivity` is a command and imports no signal, so the presence path stays
    polyfill-free. Holding that import boundary is a P1 rule (and a bundle-test assertion).
- **Cleanup via Explicit Resource Management (`using`), matching the repo.** Mirrors the
  existing `DiscordSession.asUser()` `Disposable` pattern. The escape-hatch `createClient()`
  returns a `Disposable` (`using client = createClient(...)` → `Drop` + stop pump +
  unregister at scope exit, even on throw). `subscribe()` returns a value that is **both** a
  `Disposable` and a callable unsubscribe (`using sub = status.subscribe(cb)` _or_
  `const off = status.subscribe(cb); off()`). The process-lifetime ambient singleton is torn
  down via explicit `shutdown()` (you don't `using` a process-global).

### Lifecycle & config

- **`createClient(config)`** is the low-level primitive (returns a `using`-friendly handle).
  The ambient singleton is one such client parked module-side; `init()`/`configure()` operate
  on it. One process-global pump drives all clients — **verified: `Discord_RunCallbacks()`
  takes no client arg**, so multiplicity does not multiply pumps.
- **Activation = explicit `init()` with lazy fallback** (user choice "both"): `configure(cfg)`
  stores config with _no side effects_; `init(cfg?)` eagerly activates (dlopen + `Init` +
  start pump); the first operation lazily activates from stored config if `init` was skipped.
  A single idempotent private `ensureActive()` backs all three (no double-init), echoing
  REST's `#processQueue` guard. Named `init()` (not `initPresence()`) — it activates the
  whole client (auth/presence/future features), not just presence.
- **Config resolution is layered:** explicit arg → `configure()` value → env
  (`DISCORD_APPLICATION_ID`, `DISCORD_SDK_PATH`, matching the repo's Varlock env usage) → for
  `libraryPath`, finally a **convention probe** (next-to-exe, `./lib/discord_social_sdk/...`).
  So `init()` with no args works when env/convention suffice.
- **Config surface (from `cdiscord.h`):** required = `applicationId` (`SetApplicationId`),
  `libraryPath` (defaultable via env/convention). Optional = `apiBase`/`webBase`
  (`ClientCreateOptions`/`InitWithBases`; prod defaults), `httpTimeout`
  (`SetHttpRequestTimeout`), `logDir`/`voiceLogDir`. Out of v0 scope: `cpuAffinityMask`,
  `experimentalAudioSystem` (voice/advanced).

## 5. Package layout

New workspace packages (names provisional, MIT, scoped `@discordkit`, following the
existing `oauth` package.json conventions: `type: module`, `@discordkit/source` export
condition, `dist/**` published):

| Package                                           | Runtime       | Contents                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@discordkit/native`                              | shared (Node) | **Runtime-agnostic keystone.** FFI backend seam (Koffi impl now, node:ffi later) + ambient-singleton lifecycle (`configure`/`init`/`createClient`/`shutdown`/`useClient`) + the per-client `status` `Signal.State` + the `subscribe()` Watcher helper + `onLog`. The one place that knows the C ABI. **No** Electron/Tauri/React import. Feature ops live in subpaths. |
| `@discordkit/native/auth`                         | subpath       | `authorize` (PKCE → GetToken → UpdateToken → Connect); the only declarer of the auth C functions.                                                                                                                                                                                                                                                                      |
| `@discordkit/native/presence`                     | subpath       | `setActivity`/`clearActivity`; the only declarer of `Discord_Client_UpdateRichPresence` + `Discord_Activity_*`.                                                                                                                                                                                                                                                        |
| `@discordkit/electron`                            | Electron      | Thin adapter: loads the keystone in the **main process**, runs the pump on an `app`-lifecycle timer, optionally forwards events to the renderer over `contextBridge`/IPC.                                                                                                                                                                                              |
| `@discordkit/tauri`                               | Tauri         | (a) **sidecar host** (small Node entry running the keystone, JSON-over-stdio) + (b) TS bindings for the **Rust plugin** below.                                                                                                                                                                                                                                         |
| `tauri-plugin-discordkit`                         | Tauri/Rust    | Rust crate: `bindgen` over `cdiscord.h`, safe wrapper, `tauri::plugin` w/ commands + events, published to crates.io. (Separate from the npm graph.)                                                                                                                                                                                                                    |
| _(later)_ `@discordkit/react` or `/react` subpath | renderer      | Optional real React hooks (`useDiscordStatus`) over the adapter's IPC events. Out of v0; noted so the layering is clear.                                                                                                                                                                                                                                               |

The keystone isolates all ABI knowledge so the two TS entry points (Electron,
Tauri-sidecar) never duplicate FFI declarations, and the TS surface is identical everywhere.

### TS API sketch (identical on every runtime)

```ts
import { init, subscribe, shutdown } from "@discordkit/native";
import { authorize } from "@discordkit/native/auth";
import { setActivity, clearActivity } from "@discordkit/native/presence";

// Activate the ambient singleton; returns the client. Explicit config, or omit
// to use env/convention. (configure({ httpTimeout }); init();  also works.)
const client = init({
  applicationId: 123n,
  libraryPath: "./lib/discord_social_sdk"
});

// `client.status` is a TC39 Signal.State (signal-polyfill), driven off OnStatusChanged.
client.status.get(); // "Disconnected" | … | "Ready" (always current)
using sub = subscribe(client.status, (s) => {
  // free helper wrapping Signal.subtle.Watcher;
  if (s === "Ready") console.log("connected"); // auto-unsubscribes at scope exit (Disposable)
}); // or: const off = subscribe(...); off()
// power users compute off the raw signal: new Signal.Computed(() => client.status.get() === "Ready")
using log = client.onLog(({ message, severity }) =>
  console.log(`[${severity}] ${message}`)
);

// Ops read the ambient client — NO handle argument.
await authorize({ scopes: "presence" }); // browser PKCE → token → Connect
// command (not a signal write): plain object …
await setActivity({
  type: "playing",
  state: "In Competitive Match",
  details: "Rank: Diamond II"
});
// … or builder callback over a plain object (hosts helpers for buttons/timestamps):
await setActivity((a) => {
  a.type = "playing";
  a.state = "In Match";
  a.button("Join", joinUrl);
});
await clearActivity();

shutdown(); // tears down the process-lifetime singleton

// --- escape hatch: explicit, `using`-friendly client (multi-client / tests) ---
using client = createClient({ applicationId: 456n, libraryPath });
await setActivity({ type: "watching", state: "demo" }, { client });
// `using` => Drop + stop-pump + unregister at scope exit, even on throw.
```

The pump (`Discord_RunCallbacks`) is hidden inside the lifecycle and driven on a main-thread
timer; consumers never see it. One process-global pump serves the singleton **and** every
`createClient` handle.

## 6. SDK delivery & the CI-binary problem

### Developer-facing delivery: **BYO-binary + scaffolding CLI**

- Baseline (always works): developer downloads the SDK from _their_ Portal into their
  project; they point our client at it via `libraryPath` (or a conventional location our
  loader probes: `./lib/discord_social_sdk/...`, next-to-exe, env var).
- Convenience: a `discordkit-native` CLI that **scaffolds** — creates the expected folder
  layout, copies a developer-provided zip/extracted dir into place, writes the per-platform
  copy step (Electron forge/builder `extraResources`; Tauri `bundle.resources`/sidecar),
  and validates the lib loads. It **does not** download from Discord (no stable URL).

### The CI/E2E binary problem (highest project risk)

We can neither commit nor redistribute the binary, so CI cannot freely obtain it. Plan,
mirroring this repo's existing "mock in CI, real-Discord smoke locally" philosophy:

1. **Contract tests (CI, no real SDK): a pure-TypeScript mock backend.** _(P1 decision —
   supersedes the originally-planned compiled stub library.)_ Because the binding logic
   depends only on the FFI backend seam, contract tests inject a `mockBackend`
   (`src/ffi/__mocks__/mockBackend.ts`) that fulfills the same interface and scripts SDK
   behavior (status `Disconnected→Connecting→Ready` on pump; rich-presence ack callbacks;
   call/leak recording). `createClient({ backend: mockBackend })` then exercises _all_ of our
   code — lifecycle, status-signal wiring, the presence call/marshal sequence, dispose — with
   **zero native code and no compiler**, so it runs everywhere in CI. This is a better test
   boundary than a compiled stub: it tests _our_ logic (where bugs live), whereas koffi's
   marshaling-to-a-real-C-ABI is covered by the real-SDK smoke (step 2) — a compiled stub
   would mostly duplicate that while adding a toolchain dependency. (A C compiler turned out
   to be available locally, but the mock is preferred on the merits above.) Plus a
   **tree-shaking test** asserting feature isolation + `signal-polyfill`/`koffi` externality
   against the built `dist/`.
2. **Real-SDK smoke (local + optional gated CI):** the maintainer holds a downloaded SDK
   copy in a **private** location (GitHub Actions secret pointing at a private bucket /
   self-hosted runner / manually-seeded Actions cache — _never_ committed). A workflow
   gated on that secret runs the real E2E. On forks/PRs without the secret, it's skipped.
3. **Live presence verification (local, maintainer-driven):** like the OAuth examples —
   run an example app, complete the real Discord login, assert presence appears (Playwright
   MCP drives the UI; the maintainer holds credentials).

> Open item: confirm whether a self-hosted runner or a private-bucket-via-secret is the
> preferred CI seam before building step 2. Step 1 is unblocked and should come first.

### Our own working copy (already in place)

For local dev and the P0 spike, a downloaded SDK lives **gitignored** at
`vendor/discord-social-sdk/<version>/` (currently `1.9.16441`), separate from the
docs-only `social-sdk-docs/`. `vendor/` is in `.gitignore` (license: never commit). Tests
and the spike resolve it via a `DISCORD_SDK_PATH` env var defaulting to that vendor path.
Per-platform release libs live at `…/<version>/{bin,lib}/release[/arm64]`.

## 7. Examples (E2E testbeds, in `./examples`)

Two minimal apps, each public-screen + "Connect Discord" → shows live presence, matching
the existing examples' role as both docs and E2E targets:

- `examples/with-electron` — Electron app; main process hosts `@discordkit/electron`;
  renderer toggles presence over IPC.
- `examples/with-tauri` — Tauri app demonstrating **both** seams behind one UI toggle:
  the Rust `tauri-plugin-discordkit` and the Node sidecar via `@discordkit/tauri`.

Unique dev ports continuing the existing scheme (electron N/A; tauri dev server picks an
unused port, e.g. 3400). Both are private packages, added to `.bumpy` ignore list.

## 8. Phased execution plan

Each phase ends at a verifiable checkpoint (CLAUDE.md Rule 4/10). Do not start a phase
until the prior checkpoint is green.

- **P0 — De-risk the ABI (spike, throwaway). ✅ DONE (2026-06-12).** A Koffi spike
  (`scripts/spike/`, structured to prove the FFI seam: `backend.mjs` interface,
  `koffi-backend.mjs` impl, `sdk.mjs` binding logic with no koffi import, `run.mjs` runner)
  loaded `discord_partner_sdk.dll`, `Init`/`Drop`'d a `Discord_Client`, registered the
  status+log callbacks, and **a C→JS log callback fired on `Discord_RunCallbacks()`** —
  real SDK internals (`rpc_manager.cpp` logs), confirming: opaque-handle alloc/init/drop,
  `Discord_String` UTF-8-by-length decode, int32 enums, the callback triple `(cb,null,null)`,
  main-thread callback delivery on the pump, and that the seam holds (binding logic never
  imported koffi). Koffi pinned to `3.0.2` (root devDep, >48h-old per quarantine).
  _Throwaway — delete once P1 lands the real package._
- **P1 — `@discordkit/native` core.** FFI declarations for the presence+auth subset of
  `cdiscord.h`; the singleton + signals + `using` client; the stub-library loader test
  harness (§6.1); a bundle test proving `setActivity`-only tree-shakes.
  _Checkpoint:_ `vp test` green against the stub; real-SDK smoke passes locally.
- **P2 — `@discordkit/electron` + `examples/with-electron`.** _Checkpoint:_ example shows
  real presence locally (Playwright-driven login); CI runs loader/contract tests.
- **P3 — Tauri sidecar (`@discordkit/tauri` sidecar) + half of `examples/with-tauri`.**
  _Checkpoint:_ presence via sidecar locally.
- **P4 — `tauri-plugin-discordkit` (Rust, bindgen) + the plugin half of the example.**
  _Checkpoint:_ presence via the Rust plugin locally.
- **P5 — Scaffolding CLI + docs + CI binary seam (§6.2).** _Checkpoint:_ `npx … init`
  wires a fresh app end-to-end; gated real-E2E workflow green.

Bumpy bump files per PR throughout; first publish of each public package is **manual**
(OIDC can't attach to a nonexistent package — see CLAUDE.md publishing notes).

## 9. Open questions for the owner

1. **CI binary seam (§6.3):** self-hosted runner, private-bucket-via-secret, or
   real-E2E-local-only with CI limited to stub/contract tests? (Recommend: start
   local-only + stub-in-CI; add gated real-E2E later.)
2. **Rust crate ownership:** are you comfortable maintaining a published crate
   (`tauri-plugin-discordkit`) alongside the npm packages, or should the Tauri story be
   **sidecar-first** and the Rust plugin a fast-follow once the ABI binding is proven in TS?
3. **Naming:** `@discordkit/native` vs `@discordkit/social` vs `@discordkit/social-sdk`
   for the keystone package.

```

```

## Appendix — local doc corpus

`scripts/docs/fetch-social-sdk.ts` saves all Social SDK docs to `social-sdk-docs/`
(gitignored): `guides/**` (48 narrative pages) and `api/*.md` (31 flattened Doxygen class
references, incl. `Client`, `Activity*`, `AuthorizationArgs`, `ClientCreateOptions`,
`ClientResult`). Re-run `node --experimental-strip-types scripts/docs/fetch-social-sdk.ts`
to refresh; `--force` to re-fetch all, `--list` to preview URLs.
