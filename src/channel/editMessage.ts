import { z } from "zod";
import type { Message } from "./types";
import { messageContent } from "./types";
import { mutation, patch } from "../utils";

export const editMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1),
  body: messageContent
});

/**
 * Edit a previously sent message. The fields `content`, `embeds`, and `flags` can be edited by the original message author. Other users can only edit `flags` and only if they have the `MANAGE_MESSAGES` permission in the corresponding channel. When specifying flags, ensure to include all previously set flags/bits in addition to ones that you are modifying. Only `flags` documented in the table below may be modified by users (unsupported flag changes are currently ignored without error).
 *
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowed_mentions` field of the edit request controls how this happens. If there is no explicit `allowed_mentions` in the edit request, the content will be parsed with default allowances, that is, without regard to whether or not an `allowed_mentions` was present in the request that originally created the message.
 *
 * Returns a message object. Fires a [Message Update](https://discord.com/developers/docs/topics/gateway#message-update) Gateway event.
 *
 * Refer to [Uploading Files](https://discord.com/developers/docs/reference#uploading-files) for details on attachments and `multipart/form-data` requests. Any provided files will be appended to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.
 *
 * *Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.*
 *
 * https://discord.com/developers/docs/resources/channel#edit-message
 */
export const editMessage = mutation(editMessageSchema, async ({ channel, message, body }) =>
  patch<Message>(`/channels/${channel}/messages/${message}`, body)
);
