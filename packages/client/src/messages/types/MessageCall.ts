import * as v from "valibot";
import { snowflake, timestamp, schema } from "@discordkit/core";

const _messageCallSchema = v.object({
  /** array of user object ids that participated in the call */
  participants: v.array(snowflake),
  /** time when call ended */
  endedTimestamp: v.nullish(timestamp)
});

export interface MessageCall extends v.InferOutput<typeof _messageCallSchema> {}

/**
 * ### [Message Call](https://discord.com/developers/docs/resources/message#message-call-object)
 *
 * Information about the call in a private channel.
 */
export const messageCallSchema = schema<MessageCall>(_messageCallSchema);
