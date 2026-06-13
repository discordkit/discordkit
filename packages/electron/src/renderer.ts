/**
 * Renderer-side types. Import this in your renderer (browser context) to get a
 * fully-typed `window.discord` — the bridge the preload exposed. Contains no
 * runtime code and no `electron` import; it's pure ambient typing.
 *
 * ```ts
 * import "@discordkit/electron/renderer";
 * await window.discord.connect();
 * window.discord.onStatus((s) => console.log(s));
 * ```
 */

import type { DiscordBridge } from "./channels.js";

declare global {
  interface Window {
    /** The Discord bridge exposed by the preload's `exposeDiscord`. */
    discord: DiscordBridge;
  }
}

export type { DiscordBridge } from "./channels.js";
export type { Status, LogEntry } from "@discordkit/native";
export type { ActivityInput, ActivityType } from "@discordkit/native/presence";
export type { ScopeSet } from "@discordkit/native/auth";
