import { z } from "zod";

export const moderationActionMetaSchema = z.union([
  z.object({
    /** channel to which user content should be logged */
    channelId: z.string().min(1).optional()
  }),
  z.object({
    /** timeout duration in seconds */
    durationSeconds: z.number().positive()
  })
]);

export type ModerationActionMeta = z.infer<typeof moderationActionMetaSchema>;
