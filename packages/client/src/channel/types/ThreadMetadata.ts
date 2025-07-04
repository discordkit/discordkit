import * as v from "valibot";
import { timestamp } from "@discordkit/core";
import { autoArchiveDurationSchema } from "./AutoArchiveDuration.js";

export const threadMetadataSchema = v.object({
  /** whether the thread is archived */
  archived: v.boolean(),
  /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  autoArchiveDuration: autoArchiveDurationSchema,
  /** timestamp when the thread's archive status was last changed, used for calculating recent activity */
  archiveTimestamp: timestamp,
  /** whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it */
  locked: v.boolean(),
  /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
  invitable: v.exactOptional(v.boolean()),
  /** timestamp when the thread was created; only populated for threads created after 2022-01-09 */
  createTimestamp: v.nullish(timestamp)
});

export interface ThreadMetadata
  extends v.InferOutput<typeof threadMetadataSchema> {}
