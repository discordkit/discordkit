import type { ActivityButton } from "./ActivityButton";
import type { ActivityFlags } from "./ActivityFlags";
import type { ActivitySecrets } from "./ActivitySecrets";
import type { ActivityAssets } from "./ActivityAssets";
import type { ActivityParty } from "./ActivityParty";
import type { ActivityEmoji } from "./ActivityEmoji";
import type { ActivityTimestamps } from "./ActivityTimestamps";

export interface Activity {
  /** the activity's name */
  name: string;
  /** activity type */
  type: number;
  /** stream url, is validated when type is 1 */
  url?: string;
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  createdAt: number;
  /** unix timestamps for start and/or end of the game */
  timestamps?: ActivityTimestamps;
  /** application id for the game */
  applicationId?: string;
  /** what the player is currently doing */
  details?: string;
  /** the user's current party status */
  state?: string;
  /** the emoji used for a custom status */
  emoji?: ActivityEmoji;
  /** information for the current party of the player */
  party?: ActivityParty;
  /** images for the presence and their hover texts */
  assets?: ActivityAssets;
  /** secrets for Rich Presence joining and spectating */
  secrets?: ActivitySecrets;
  /** whether or not the activity is an instanced game session */
  instance?: boolean;
  /** activity flags ORd together, describes what the payload includes */
  flags?: ActivityFlags;
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons?: ActivityButton[];
}
