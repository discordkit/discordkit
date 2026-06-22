/**
 * Webview-side types. The bridge is composed per-domain, so the typing is
 * composable too: combine {@link CoreBridge} with exactly the domain bridge
 * interfaces your `createClient` call composed. Unlike Electron (where the bridge
 * lands on `window.discord` and you declare its global shape), the Tauri client is
 * the value returned by `createClient`, so its type is inferred from the slices
 * you pass — these exports are for when you want to name the type explicitly.
 *
 * ```ts
 * import type { CoreBridge } from "@discordkit/tauri/renderer";
 * import type { UsersBridge } from "@discordkit/tauri/renderer/users";
 *
 * type Discord = CoreBridge & { users: UsersBridge };
 * ```
 *
 * For the common "I composed everything" case, import {@link FullBridge}.
 */

import type { CoreBridge } from "./channels/core.js";
import type { UsersBridge } from "./channels/users.js";
import type { RelationshipsBridge } from "./channels/relationships.js";
import type { InvitesBridge } from "./channels/invites.js";
import type { LobbiesBridge } from "./channels/lobbies.js";
import type { MessagesBridge } from "./channels/messaging.js";
import type { VoiceBridge } from "./channels/voice.js";

export type { CoreBridge } from "./channels/core.js";

/** The full bridge with every domain namespace, for apps that compose them all. */
export type FullBridge = CoreBridge & {
  users: UsersBridge;
  relationships: RelationshipsBridge;
  invites: InvitesBridge;
  lobbies: LobbiesBridge;
  messages: MessagesBridge;
  voice: VoiceBridge;
};

// Shared value types a webview is likely to need when handling bridge results.
export type { Status, LogEntry } from "@discordkit/native";
export type { ActivityInput, ActivityType } from "@discordkit/native/presence";
export type { ScopeSet } from "@discordkit/native/auth";
