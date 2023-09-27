import { z } from "zod";

export const messageReferenceSchema = z
  .object({
    /** id of the originating message */
    messageId: z.string().min(1).nullable(),
    /** id of the originating message's channel */
    channelId: z.string().min(1).nullable(),
    /** id of the originating message's guild */
    guildId: z.string().min(1).nullable(),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: z.boolean().nullable().default(true)
  })
  .partial();

export type MessageReference = z.infer<typeof messageReferenceSchema>;
