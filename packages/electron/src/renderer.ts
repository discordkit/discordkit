/**
 * Renderer-side types. The bridge is composed per-domain, so the renderer typing
 * is composable too: combine {@link CoreBridge} with exactly the domain bridge
 * interfaces your preload exposed, and declare `window.discord` as that union.
 * This keeps the renderer's view of `window.discord` honest — it advertises only
 * the namespaces you actually wired.
 *
 * ```ts
 * // renderer (e.g. a global.d.ts)
 * import type { CoreBridge } from "@discordkit/electron/renderer";
 * import type { UsersBridge } from "@discordkit/electron/renderer/users";
 *
 * declare global {
 *   interface Window {
 *     discord: CoreBridge & { users: UsersBridge };
 *   }
 * }
 * ```
 *
 * For the common "I exposed everything" case, import {@link FullBridge}.
 */

import type { CoreBridge } from "./channels/core.js";
import type { UsersBridge } from "./channels/users.js";
import type { RelationshipsBridge } from "./channels/relationships.js";
import type { InvitesBridge } from "./channels/invites.js";
import type { LobbiesBridge } from "./channels/lobbies.js";
import type { MessagesBridge } from "./channels/messaging.js";
import type { VoiceBridge } from "./channels/voice.js";

export type { CoreBridge } from "./channels/core.js";

/** The full bridge with every domain namespace, for apps that expose them all. */
export type FullBridge = CoreBridge & {
  users: UsersBridge;
  relationships: RelationshipsBridge;
  invites: InvitesBridge;
  lobbies: LobbiesBridge;
  messages: MessagesBridge;
  voice: VoiceBridge;
};

// Shared value types a renderer is likely to need when handling bridge results.
export type { Status, LogEntry } from "@discordkit/native";
export type { ActivityInput, ActivityType } from "@discordkit/native/presence";
export type { ScopeSet } from "@discordkit/native/auth";
