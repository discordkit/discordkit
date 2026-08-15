import { dispatchEvent } from "./dispatch.js";
import type { MessageDelete } from "./types/MessageDelete.js";

/**
 * ### [Message Delete](https://discord.com/developers/docs/events/gateway-events#message-delete)
 *
 * Sent when a message is deleted. The payload is only ids — the message is
 * already gone, so there is nothing left to fetch. If you need its content you
 * must have cached it before the delete.
 *
 * Gated by `GUILD_MESSAGES` or `DIRECT_MESSAGES`.
 */
export const onMessageDelete = dispatchEvent<MessageDelete, `MESSAGE_DELETE`>(
  `MESSAGE_DELETE`
);
