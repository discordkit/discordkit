import { dispatchEvent } from "../dispatch.js";
import type { MessageDeleteBulk } from "./types/MessageDelete.js";

/**
 * ### [Message Delete Bulk](https://discord.com/developers/docs/events/gateway-events#message-delete-bulk)
 *
 * Sent when multiple messages are deleted at once, e.g. by a moderation purge.
 *
 * Gated by `GUILD_MESSAGES`. Note there is no DM equivalent — bulk deletes only
 * happen in guilds.
 */
export const onMessageDeleteBulk = dispatchEvent<
  MessageDeleteBulk,
  `MESSAGE_DELETE_BULK`
>(`MESSAGE_DELETE_BULK`);
