import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const messageReferenceSchema = z
  .object({
    /** id of the originating message */
    messageId: snowflake.nullish(),
    /** id of the originating message's channel */
    channelId: snowflake.nullish(),
    /** id of the originating message's guild */
    guildId: snowflake.nullish(),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: z.boolean().nullish().default(true)
  })
  .partial();

export type MessageReference = z.infer<typeof messageReferenceSchema>;
