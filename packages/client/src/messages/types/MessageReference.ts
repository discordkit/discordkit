import { snowflake } from "@discordkit/core";
import { object, nullish, boolean, partial, type InferOutput } from "valibot";

export const messageReferenceSchema = partial(
  object({
    /** id of the originating message */
    messageId: nullish(snowflake),
    /** id of the originating message's channel */
    channelId: nullish(snowflake),
    /** id of the originating message's guild */
    guildId: nullish(snowflake),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: nullish(boolean(), true)
  })
);

export type MessageReference = InferOutput<typeof messageReferenceSchema>;
