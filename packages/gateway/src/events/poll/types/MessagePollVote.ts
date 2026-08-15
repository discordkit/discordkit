// https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";

const _messagePollVoteSchema = v.object({
  /** ID of the user */
  userId: snowflake,
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the message */
  messageId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** ID of the answer */
  answerId: v.number()
});

export interface MessagePollVote extends v.InferOutput<
  typeof _messagePollVoteSchema
> {}

/**
 * ### [Message Poll Vote](https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add)
 *
 * Shared by the add and remove events, which carry identical fields.
 *
 * On a multi-select poll Discord sends **one event per answer**, so a single
 * user changing their mind can produce several events — treat them as
 * individual votes rather than a whole ballot.
 */
export const messagePollVoteSchema = schema<MessagePollVote>(
  _messagePollVoteSchema
);
