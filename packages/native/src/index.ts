/**
 * `@discordkit/native` — functional bridge to the Discord Social SDK for native
 * desktop runtimes (Electron, Tauri, headless Node, …).
 *
 * The root entry exposes only the **lifecycle, status, and subscription**
 * surface. Feature operations live in subpaths so importing one never pulls in
 * another (the tree-shaking boundary):
 *
 * - `@discordkit/native/presence` — `setActivity`, `clearActivity`
 * - `@discordkit/native/auth`     — `authorize`
 * - `@discordkit/native/users`    — `getCurrentUser`, `getUser`
 * - `@discordkit/native/relationships` — friends list + management
 *
 * @example
 * ```ts
 * import { init, subscribe } from "@discordkit/native";
 * import { setActivity } from "@discordkit/native/presence";
 *
 * const client = init({ applicationId: 123n });
 * using sub = subscribe(client.status, (s) => console.log(s));
 * await setActivity({ type: "playing", state: "In Match" });
 * ```
 */

export { configure, init, shutdown, useClient } from "./ambient.js";
export { createClient } from "./client.js";
export type { ClientConfig, DiscordClient, Subscription } from "./client.js";
export { subscribe } from "./subscribe.js";
export type { LogEntry, LogSeverity, Status } from "./types.js";
