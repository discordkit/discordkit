import { z } from "zod";
import { autoArchiveDurationSchema } from "./AutoArchiveDuration";

export const threadMetadataSchema = z.object({
  /** whether the thread is archived */
  archived: z.boolean(),
  /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  autoArchiveDuration: autoArchiveDurationSchema,
  /** timestamp when the thread's archive status was last changed, used for calculating recent activity */
  archiveTimestamp: z.string().datetime(),
  /** whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it */
  locked: z.boolean(),
  /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
  invitable: z.boolean().nullable(),
  /** timestamp when the thread was created; only populated for threads created after 2022-01-09 */
  createTimestamp: z.string().datetime().nullable().optional()
});

export type ThreadMetadata = z.infer<typeof threadMetadataSchema>;
