// https://discord.com/developers/docs/events/gateway-events#message-reaction-add

import * as v from "valibot";
import { partialSchema, schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Emoji, emojiSchema } from "@discordkit/client/emoji/types/Emoji";
import { memberSchema } from "@discordkit/client/guild/types/Member";
import { reactionTypeSchema } from "./ReactionType.js";

/**
 * Reaction events carry a **partial** emoji — the docs say only `id`, `name`,
 * and `animated` are present.
 *
 * In practice this is documentation rather than enforcement: `emojiSchema`
 * already marks everything except `id` and `name` as `exactOptional`, so a full
 * `Emoji` accepts exactly the same payloads and no test can tell them apart.
 * The wrapper is kept because it states the intent at the type level — a reader
 * shouldn't have to open `Emoji` to learn that `user` and `roles` never arrive
 * here.
 */
const partialEmoji = partialSchema<Emoji>(emojiSchema);

const _messageReactionAddSchema = v.object({
  /** ID of the user */
  userId: snowflake,
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the message */
  messageId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** Member who reacted if this happened in a guild */
  member: v.optional(memberSchema),
  /** Emoji used to react */
  emoji: partialEmoji,
  /** ID of the user who authored the message which was reacted to */
  messageAuthorId: v.optional(snowflake),
  /** `true` if this is a super-reaction */
  burst: v.boolean(),
  /** Colors used for super-reaction animation, in `#rrggbb` format */
  burstColors: v.optional(v.array(v.string())),
  /** The type of reaction */
  type: reactionTypeSchema
});

export interface MessageReactionAdd extends v.InferOutput<
  typeof _messageReactionAddSchema
> {}

/**
 * ### [Message Reaction Add](https://discord.com/developers/docs/events/gateway-events#message-reaction-add)
 *
 * Sent when a user adds a reaction to a message.
 */
export const messageReactionAddSchema = schema<MessageReactionAdd>(
  _messageReactionAddSchema
);

const _messageReactionRemoveSchema = v.object({
  /** ID of the user */
  userId: snowflake,
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the message */
  messageId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** Emoji used to react */
  emoji: partialEmoji,
  /** `true` if this was a super-reaction */
  burst: v.boolean(),
  /** The type of reaction */
  type: reactionTypeSchema
});

export interface MessageReactionRemove extends v.InferOutput<
  typeof _messageReactionRemoveSchema
> {}

/**
 * ### [Message Reaction Remove](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove)
 *
 * Note this carries **no** `member` — unlike the add event, Discord doesn't
 * include the guild member who removed the reaction.
 */
export const messageReactionRemoveSchema = schema<MessageReactionRemove>(
  _messageReactionRemoveSchema
);

const _messageReactionRemoveAllSchema = v.object({
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the message */
  messageId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake)
});

export interface MessageReactionRemoveAll extends v.InferOutput<
  typeof _messageReactionRemoveAllSchema
> {}

/**
 * ### [Message Reaction Remove All](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all)
 */
export const messageReactionRemoveAllSchema = schema<MessageReactionRemoveAll>(
  _messageReactionRemoveAllSchema
);

const _messageReactionRemoveEmojiSchema = v.object({
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** ID of the message */
  messageId: snowflake,
  /** Emoji that was removed */
  emoji: partialEmoji
});

export interface MessageReactionRemoveEmoji extends v.InferOutput<
  typeof _messageReactionRemoveEmojiSchema
> {}

/**
 * ### [Message Reaction Remove Emoji](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji)
 *
 * Sent when a bot removes every instance of one emoji from a message.
 */
export const messageReactionRemoveEmojiSchema =
  schema<MessageReactionRemoveEmoji>(_messageReactionRemoveEmojiSchema);
