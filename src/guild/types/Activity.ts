import { z } from "zod";
import { activityButton } from "./ActivityButton";
import { activityFlags } from "./ActivityFlags";
import { activitySecrets } from "./ActivitySecrets";
import { activityAssets } from "./ActivityAssets";
import { activityParty } from "./ActivityParty";
import { activityEmoji } from "./ActivityEmoji";
import { activityTimestamps } from "./ActivityTimestamps";

export const activity = z.object({
  /** the activity's name */
  name: z.string(),
  /** activity type */
  type: z.number(),
  /** stream url, is validated when type is 1 */
  url: z.string().optional(),
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: z.number(),
  /** unix timestamps for start and/or end of the game */
  timestamps: activityTimestamps.optional(),
  /** application id for the game */
  applicationId: z.string().optional(),
  /** what the player is currently doing */
  details: z.string().optional(),
  /** the user's current party status */
  state: z.string().optional(),
  /** the emoji used for a custom status */
  emoji: activityEmoji.optional(),
  /** information for the current party of the player */
  party: activityParty.optional(),
  /** images for the presence and their hover texts */
  assets: activityAssets.optional(),
  /** secrets for Rich Presence joining and spectating */
  secrets: activitySecrets.optional(),
  /** whether or not the activity is an instanced game session */
  instance: z.boolean().optional(),
  /** activity flags ORd together, describes what the payload includes */
  flags: activityFlags.optional(),
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons: activityButton.array().optional()
});

export type Activity = z.infer<typeof activity>;
