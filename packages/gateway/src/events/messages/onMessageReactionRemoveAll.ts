import { dispatchEvent } from "../dispatch.js";
import type { MessageReactionRemoveAll } from "./types/MessageReaction.js";

/**
 * ### [Message Reaction Remove All](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all)
 *
 * Sent when every reaction is cleared from a message at once.
 *
 * Gated by `GUILD_MESSAGE_REACTIONS` or `DIRECT_MESSAGE_REACTIONS`.
 */
export const onMessageReactionRemoveAll = dispatchEvent<
  MessageReactionRemoveAll,
  `MESSAGE_REACTION_REMOVE_ALL`
>(`MESSAGE_REACTION_REMOVE_ALL`, [
  `GUILD_MESSAGE_REACTIONS`,
  `DIRECT_MESSAGE_REACTIONS`
]);
