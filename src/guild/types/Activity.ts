import { z } from "zod";
import { activityButtonSchema } from "./ActivityButton.ts";
import { activityFlagsSchema } from "./ActivityFlags.ts";
import { activitySecretsSchema } from "./ActivitySecrets.ts";
import { activityAssetsSchema } from "./ActivityAssets.ts";
import { activityPartySchema } from "./ActivityParty.ts";
import { activityEmojiSchema } from "./ActivityEmoji.ts";
import { activityTimestampsSchema } from "./ActivityTimestamps.ts";

export const activitySchema = z.object({
  /** the activity's name */
  name: z.string(),
  /** activity type */
  type: z.number(),
  /** stream url, is validated when type is 1 */
  url: z.string().optional(),
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: z.number(),
  /** unix timestamps for start and/or end of the game */
  timestamps: activityTimestampsSchema.optional(),
  /** application id for the game */
  applicationId: z.string().optional(),
  /** what the player is currently doing */
  details: z.string().optional(),
  /** the user's current party status */
  state: z.string().optional(),
  /** the emoji used for a custom status */
  emoji: activityEmojiSchema.optional(),
  /** information for the current party of the player */
  party: activityPartySchema.optional(),
  /** images for the presence and their hover texts */
  assets: activityAssetsSchema.optional(),
  /** secrets for Rich Presence joining and spectating */
  secrets: activitySecretsSchema.optional(),
  /** whether or not the activity is an instanced game session */
  instance: z.boolean().optional(),
  /** activity flags ORd together, describes what the payload includes */
  flags: activityFlagsSchema.optional(),
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons: activityButtonSchema.array().optional()
});

export type Activity = z.infer<typeof activitySchema>;
