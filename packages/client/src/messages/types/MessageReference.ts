import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { messageReferenceTypeSchema } from "./MessageRefrenceType.js";

export const messageReferenceSchema = v.partial(
  v.object({
    /** type of reference. */
    type: messageReferenceTypeSchema,
    /** id of the originating message */
    messageId: snowflake,
    /** id of the originating message's channel */
    channelId: snowflake,
    /** id of the originating message's guild */
    guildId: snowflake,
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: v.boolean()
  })
);

export interface MessageReference
  extends v.InferOutput<typeof messageReferenceSchema> {}
