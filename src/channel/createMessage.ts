import { z } from "zod";
import { messageContent, type Message } from "./types";
import { mutation, post } from "../utils";

export const createMessageSchema = z.object({
  channel: z.string().min(1),
  body: messageContent
});

/**
 * Post a message to a guild text or DM channel. Returns a [message](https://discord.com/developers/docs/resources/channel#message-object) object. Fires a [Message Create](https://discord.com/developers/docs/topics/gateway#message-create) Gateway event. See [message formatting](https://discord.com/developers/docs/reference#message-formatting) for more information on how to properly format messages.
 *
 * To create a message as a reply to another message, apps can include a [`message_reference`](https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure) with a `message_id`. The `channel_id` and `guild_id` in the `message_reference` are optional, but will be validated if provided.
 *
 * Files must be attached using a `multipart/form-data` body as described in [Uploading Files](https://discord.com/developers/docs/reference#uploading-files).
 *
 * **Limitations**
 * - When operating on a guild channel, the current user must have the `SEND_MESSAGES` permission.
 * - When sending a message with `tts` (text-to-speech) set to `true`, the current user must have the `SEND_TTS_MESSAGES` permission.
 * - When creating a message as a reply to another message, the current user must have the `READ_MESSAGE_HISTORY` permission.
 *      - The referenced message must exist and cannot be a system message.
 * - The maximum request size when sending a message is **8MiB**
 * - For the embed object, you can set every field except `type` (it will be `rich` regardless of if you try to set it), `provider`, `video`, and any `height`, `width`, or `proxy_url` values for images.
 *
 *
 * *Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and utilizing `allowed_mentions` to prevent unexpected mentions.*
 *
 * https://discord.com/developers/docs/resources/channel#create-message
 */
export const createMessage = mutation(createMessageSchema, async ({ channel, body }) =>
  post<Message>(`/channels/${channel}/messages`, body)
);
