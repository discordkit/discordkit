import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { activityButtonSchema } from "./ActivityButton.js";
import { activitySecretsSchema } from "./ActivitySecrets.js";
import { activityAssetsSchema } from "./ActivityAssets.js";
import { activityPartySchema } from "./ActivityParty.js";
import { activityEmojiSchema } from "./ActivityEmoji.js";
import { activityTimestampsSchema } from "./ActivityTimestamps.js";

export const activitySchema = v.object({
  /** the activity's name */
  name: v.string(),
  /** activity type */
  type: v.number(),
  /** stream url, is validated when type is 1 */
  url: v.optional(v.string()),
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  /** unix timestamps for start and/or end of the game */
  timestamps: v.optional(activityTimestampsSchema),
  /** application id for the game */
  applicationId: v.optional(snowflake),
  /** what the player is currently doing */
  details: v.optional(v.string()),
  /** the user's current party status */
  state: v.optional(v.string()),
  /** the emoji used for a custom status */
  emoji: v.optional(activityEmojiSchema),
  /** information for the current party of the player */
  party: v.optional(activityPartySchema),
  /** images for the presence and their hover texts */
  assets: v.optional(activityAssetsSchema),
  /** secrets for Rich Presence joining and spectating */
  secrets: v.optional(activitySecretsSchema),
  /** whether or not the activity is an instanced game session */
  instance: v.optional(v.boolean()),
  /** activity flags ORd together, describes what the payload includes */
  flags: v.optional(v.pipe(v.number(), v.integer())),
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons: v.optional(v.array(activityButtonSchema))
});

export interface Activity extends v.InferOutput<typeof activitySchema> {}
