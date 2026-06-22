/**
 * Rich presence — the public surface of `@discordkit/native/presence`.
 *
 * Organized one file per `discordpp` C++ class (mirroring the SDK docs): {@link ./activity.ts | Activity} + its sub-objects {@link ./activityAssets.ts | Assets}, {@link ./activityTimestamps.ts | Timestamps}, {@link ./activityParty.ts | Party}, {@link ./activityButton.ts | Button}. The client-level operations ({@link ./richPresence.ts}) orchestrate them into `setActivity` / `clearActivity`.
 */
export { setActivity, clearActivity } from "./richPresence.js";

export type {
  ActivityInput,
  ActivityBuilder,
  PresenceOptions
} from "./types.js";
export type { ActivityType } from "./activity.js";
export type { ActivityAssets } from "./activityAssets.js";
export type { ActivityTimestamps } from "./activityTimestamps.js";
export type { ActivityParty } from "./activityParty.js";
export type { ActivityButton } from "./activityButton.js";
