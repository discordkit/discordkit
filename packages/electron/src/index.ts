/**
 * `@discordkit/electron` — run the Discord Social SDK in Electron's main process
 * and reach it from the renderer over a typed IPC bridge.
 *
 * The bridge is **composed per-domain**, mirroring `@discordkit/native`'s
 * subpaths, so an app bundles only the native code for the features it wires
 * (importing presence does not pull in voice). Import the piece for each Electron
 * context + each domain you use:
 *
 * - `@discordkit/electron/main`            — `registerDiscord` (core)
 * - `@discordkit/electron/main/<domain>`   — `registerUsers`, `registerLobbies`, …
 * - `@discordkit/electron/preload`         — `exposeDiscord` (core)
 * - `@discordkit/electron/preload/<domain>`— `usersSlice`, `lobbiesSlice`, …
 * - `@discordkit/electron/renderer`        — `CoreBridge` / `FullBridge` typing
 * - `@discordkit/electron/renderer/<domain>` — per-domain bridge typing
 *
 * The root entry re-exports only the shared CORE IPC contract (channel names +
 * core types), useful if you wire the bridge yourself.
 */

export { CORE_CHANNELS } from "./channels/core.js";
export type {
  CoreBridge,
  ConnectMessage,
  ActivityMessage
} from "./channels/core.js";
