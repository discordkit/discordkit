import { z } from "zod";

export const messageReferenceSchema = z
  .object({
    /** id of the originating message */
    messageId: z.string().min(1),
    /** id of the originating message's channel */
    channelId: z.string().min(1),
    /** id of the originating message's guild */
    guildId: z.string().min(1),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: z.boolean()
  })
  .partial();

export type MessageReference = z.infer<typeof messageReferenceSchema>;
