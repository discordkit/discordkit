import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const messageReferenceSchema = z
  .object({
    /** id of the originating message */
    messageId: snowflake.nullable(),
    /** id of the originating message's channel */
    channelId: snowflake.nullable(),
    /** id of the originating message's guild */
    guildId: snowflake.nullable(),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: z.boolean().nullable().default(true)
  })
  .partial();

export type MessageReference = z.infer<typeof messageReferenceSchema>;
