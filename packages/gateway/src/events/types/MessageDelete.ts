// https://discord.com/developers/docs/events/gateway-events#message-delete

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";

const _messageDeleteSchema = v.object({
  /** ID of the message */
  id: snowflake,
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake)
});

export interface MessageDelete extends v.InferOutput<
  typeof _messageDeleteSchema
> {}

/**
 * ### [Message Delete](https://discord.com/developers/docs/events/gateway-events#message-delete)
 *
 * Only ids — the message itself is already gone, so there is nothing to fetch.
 * If you need the content, you had to have cached it before the delete.
 */
export const messageDeleteSchema = schema<MessageDelete>(_messageDeleteSchema);

const _messageDeleteBulkSchema = v.object({
  /** IDs of the messages */
  ids: v.array(snowflake),
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake)
});

export interface MessageDeleteBulk extends v.InferOutput<
  typeof _messageDeleteBulkSchema
> {}

/**
 * ### [Message Delete Bulk](https://discord.com/developers/docs/events/gateway-events#message-delete-bulk)
 */
export const messageDeleteBulkSchema = schema<MessageDeleteBulk>(
  _messageDeleteBulkSchema
);
