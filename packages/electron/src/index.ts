/**
 * `@discordkit/electron` — run the Discord Social SDK in Electron's main process
 * and reach it from the renderer over a typed IPC bridge.
 *
 * Import the piece for each Electron context (they live in subpaths so a context
 * only pulls in what it can use):
 *
 * - `@discordkit/electron/main`     — `registerDiscord(ipcMain, opts)` (main process)
 * - `@discordkit/electron/preload`  — `exposeDiscord(contextBridge, ipcRenderer)`
 * - `@discordkit/electron/renderer` — ambient `window.discord` typing
 *
 * The root entry re-exports only the shared IPC contract (channel names + types),
 * useful if you wire the bridge yourself.
 */

export { CHANNELS } from "./channels.js";
export type {
  DiscordBridge,
  ConnectMessage,
  ActivityMessage
} from "./channels.js";
