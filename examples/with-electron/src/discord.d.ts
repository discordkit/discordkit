import type { CoreBridge } from "@discordkit/electron/renderer";

/**
 * This example's `window.discord` shape. The bridge is composed per-domain, so
 * the renderer declares exactly what its preload exposed — here that's the CORE
 * surface only (presence/auth/status/log), matching `exposeDiscord(cb, ipc)` in
 * `electron/preload.ts` with no domain slices. To use more domains, expose their
 * slices in the preload and intersect their bridge types here, e.g.
 * `CoreBridge & { lobbies: LobbiesBridge }`.
 */
declare global {
  interface Window {
    discord: CoreBridge;
  }
}
