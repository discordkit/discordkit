# discordkit × Electron — Rich Presence Visualizer

An Electron app showing Discord **Rich Presence** via
[`@discordkit/native`](../../packages/native) (the Social SDK bridge) running in
the Electron **main process**, driven from the renderer over the typed IPC bridge
in [`@discordkit/electron`](../../packages/electron).

The renderer is a **live editor** modelled on Discord's Developer Portal Rich
Presence Visualizer: edit details/state/images/timestamps/party/buttons and the
in-app preview updates reactively while the presence is pushed to Discord
(debounced). Built with **React Aria Components**, **React Hook Form + Valibot**,
and **Tailwind v4**. A "Show Code" tab emits the equivalent `setActivity({...})`.

> **No login required.** Rich presence is set over RPC to the running Discord
> desktop client — `SetApplicationId` → `UpdateRichPresence`, no OAuth. (The
> presence shows as the activity line **under your name**, not the auto-detected
> game banner, which is Discord's own process detection and not an SDK feature.)

The SDK is native (Koffi FFI) and must run in a Node context, so it lives in the
main process. The sandboxed renderer never touches FFI — it talks to
`window.discord`, exposed by a preload bundle.

## Architecture

```
renderer (src/, sandboxed)            main process (electron/main.mjs)
  window.discord.setActivity(…)         registerDiscord(ipcMain, { applicationId })
        │  contextBridge                  │  @discordkit/native (Koffi → SDK)
        ▼                                 ▼
  electron/preload.ts  ──IPC──►  ipcMain handlers ──► setActivity / authorize / status
  (bundled to preload.bundle.cjs)        ▲
        ▲                                 │ status signal + log stream
        └──────── status/log events ──────┘ (forwarded to the renderer)
```

- **`electron/main.mjs`** — ESM main; creates the window and calls
  `registerDiscord(ipcMain, …)`. Readiness is driven from `whenReady().then(...)`
  (not top-level `await`) so Playwright's `_electron.launch` doesn't deadlock.
- **`electron/preload.ts`** — calls `exposeDiscord(contextBridge, ipcRenderer)`.
  The renderer is **sandboxed** (secure default), so this is **bundled** into a
  self-contained `preload.bundle.cjs` via the `preload` pack task (sandboxed
  preloads can't import from `node_modules`). `electron` stays external.
- **`src/`** — the renderer (plain TS + Vite); imports
  `@discordkit/electron/renderer` for `window.discord` typings.

## Prerequisites

1. A Discord application with the **Social SDK enabled** (Developer Portal).
2. The **Social SDK download** for your platform — it can't be redistributed, so
   download it yourself and point `DISCORD_SDK_PATH` at the extracted folder (or
   place it at `./lib/discord_social_sdk`).
3. Copy `.env.schema` → `.env` and fill in `DISCORD_APPLICATION_ID` (+ optionally
   `DISCORD_SDK_PATH`).

## Run

```sh
# from the repo root — build the workspace packages first
vp run build

# from this directory
vp run preload          # bundle the sandboxed preload
vp run build:examples   # build the renderer

# launch (dev server + Electron pointing at it)
vp run dev              # terminal 1: renderer dev server (:5173)
ELECTRON_RENDERER_URL=http://127.0.0.1:5173 electron .   # terminal 2

# …or run the built renderer directly
electron .
```

> If launching from a VS Code integrated terminal fails to open a window, unset
> `ELECTRON_RUN_AS_NODE` (the editor sets it; it makes Electron boot as plain
> Node): `env -u ELECTRON_RUN_AS_NODE electron .`

Click **Connect Discord** → a browser window opens for OAuth login → once status
reaches **Ready**, the presence buttons enable. Set/clear presence and check your
Discord profile.

## Smoke test (local, maintainer-driven)

A Playwright `_electron.launch` smoke verifies the renderer wires up to the SDK
over IPC. It needs the real SDK, so it's **local-only** (skips without the env):

```sh
DISCORD_APPLICATION_ID=… DISCORD_SDK_PATH=… vp run smoke
```
