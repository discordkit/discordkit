/**
 * `@discordkit/native` — functional bridge to the Discord Social SDK for native
 * desktop runtimes (Electron, Tauri, headless Node, …).
 *
 * The root entry exposes only the **lifecycle, status, and subscription**
 * surface. Feature operations live in subpaths so importing one never pulls in
 * another (the tree-shaking boundary):
 *
 * - `@discordkit/native/presence`         — `setActivity`, `clearActivity`
 * - `@discordkit/native/auth`             — `authorize` (OAuth2 PKCE)
 * - `@discordkit/native/users`            — `getCurrentUser`, `getUser`
 * - `@discordkit/native/relationships`    — friends list + management
 * - `@discordkit/native/activity-invites` — send/accept invites + join requests
 * - `@discordkit/native/lobbies`          — lobbies (live `Lobby`), channel linking
 * - `@discordkit/native/messaging`        — DM + lobby messages, history, events
 * - `@discordkit/native/voice`            — voice calls (live `Call`), audio devices
 *
 * @example
 * ```ts
 * import { init, subscribe } from "@discordkit/native";
 * import { setActivity } from "@discordkit/native/presence";
 *
 * const client = init({ applicationId: 123n });
 * using sub = subscribe(client.status, (s) => console.log(s)); // "ready", …
 * await setActivity({ type: "playing", state: "In Match" });
 * ```
 */

export { configure, init, shutdown, useClient } from "./ambient.js";
export { createClient } from "./client.js";
export type { ClientConfig, DiscordClient, Subscription } from "./client.js";
export { subscribe } from "./subscribe.js";
export type { LogEntry, LogSeverity, Status } from "./types.js";
export { snowflake } from "./snowflake.js";
export type {
  Snowflake,
  UserId,
  LobbyId,
  ChannelId,
  MessageId,
  GuildId,
  ApplicationId
} from "./snowflake.js";
