import { dispatchEvent } from "../dispatch.js";
import type { MessageReactionAdd } from "./types/MessageReaction.js";

/**
 * ### [Message Reaction Add](https://discord.com/developers/docs/events/gateway-events#message-reaction-add)
 *
 * Sent when a user adds a reaction to a message. Carries `member` when it
 * happened in a guild, so you usually don't need a follow-up fetch.
 *
 * Gated by `GUILD_MESSAGE_REACTIONS` or `DIRECT_MESSAGE_REACTIONS`.
 */
export const onMessageReactionAdd = dispatchEvent<
  MessageReactionAdd,
  `MESSAGE_REACTION_ADD`
>(`MESSAGE_REACTION_ADD`, [
  `GUILD_MESSAGE_REACTIONS`,
  `DIRECT_MESSAGE_REACTIONS`
]);
