import { dispatchEvent } from "../dispatch.js";
import type { MessageReactionRemoveEmoji } from "./types/MessageReaction.js";

/**
 * ### [Message Reaction Remove Emoji](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji)
 *
 * Sent when a bot removes every instance of a single emoji from a message —
 * distinct from {@link onMessageReactionRemoveAll}, which clears all emoji.
 *
 * Gated by `GUILD_MESSAGE_REACTIONS` or `DIRECT_MESSAGE_REACTIONS`.
 */
export const onMessageReactionRemoveEmoji = dispatchEvent<
  MessageReactionRemoveEmoji,
  `MESSAGE_REACTION_REMOVE_EMOJI`
>(`MESSAGE_REACTION_REMOVE_EMOJI`, [
  `GUILD_MESSAGE_REACTIONS`,
  `DIRECT_MESSAGE_REACTIONS`
]);
