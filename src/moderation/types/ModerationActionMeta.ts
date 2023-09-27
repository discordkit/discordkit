import { z } from "zod";

export const moderationActionMetaSchema = z.union([
  z.object({
    /** channel to which user content should be logged */
    channelId: z.string().min(1).optional()
  }),
  z.object({
    /** timeout duration in seconds */
    durationSeconds: z.number().int().positive().max(2419200)
  }),
  z.object({
    /** additional explanation that will be shown to members whenever their message is blocked */
    customMessage: z.string().max(150).nullable()
  })
]);

export type ModerationActionMeta = z.infer<typeof moderationActionMetaSchema>;
