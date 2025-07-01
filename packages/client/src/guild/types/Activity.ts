import {
  object,
  string,
  number,
  boolean,
  optional,
  isoTimestamp,
  integer,
  array,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { activityButtonSchema } from "./ActivityButton.js";
import { activitySecretsSchema } from "./ActivitySecrets.js";
import { activityAssetsSchema } from "./ActivityAssets.js";
import { activityPartySchema } from "./ActivityParty.js";
import { activityEmojiSchema } from "./ActivityEmoji.js";
import { activityTimestampsSchema } from "./ActivityTimestamps.js";

export const activitySchema = object({
  /** the activity's name */
  name: string(),
  /** activity type */
  type: number(),
  /** stream url, is validated when type is 1 */
  url: optional(string()),
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: pipe(string(), isoTimestamp()),
  /** unix timestamps for start and/or end of the game */
  timestamps: optional(activityTimestampsSchema),
  /** application id for the game */
  applicationId: optional(snowflake),
  /** what the player is currently doing */
  details: optional(string()),
  /** the user's current party status */
  state: optional(string()),
  /** the emoji used for a custom status */
  emoji: optional(activityEmojiSchema),
  /** information for the current party of the player */
  party: optional(activityPartySchema),
  /** images for the presence and their hover texts */
  assets: optional(activityAssetsSchema),
  /** secrets for Rich Presence joining and spectating */
  secrets: optional(activitySecretsSchema),
  /** whether or not the activity is an instanced game session */
  instance: optional(boolean()),
  /** activity flags ORd together, describes what the payload includes */
  flags: optional(pipe(number(), integer())),
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons: optional(array(activityButtonSchema))
});

export interface Activity extends InferOutput<typeof activitySchema> {}
