import { dispatchEvent } from "./dispatch.js";
import type { MessageReactionRemove } from "./types/MessageReaction.js";

/**
 * ### [Message Reaction Remove](https://discord.com/developers/docs/events/gateway-events#message-reaction-remove)
 *
 * Sent when a user removes a reaction. Unlike the add event this carries **no**
 * `member`, so resolving who removed it needs `userId` plus a fetch.
 *
 * Gated by `GUILD_MESSAGE_REACTIONS` or `DIRECT_MESSAGE_REACTIONS`.
 */
export const onMessageReactionRemove = dispatchEvent<
  MessageReactionRemove,
  `MESSAGE_REACTION_REMOVE`
>(`MESSAGE_REACTION_REMOVE`);
