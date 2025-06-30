import {
  array,
  boolean,
  maxLength,
  minLength,
  object,
  partial,
  pipe,
  string,
  unknown
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger
} from "@discordkit/core";
import { type Message, messageSchema } from "./types/Message.js";
import { embedSchema } from "./types/Embed.js";
import { allowedMentionSchema } from "./types/AllowedMention.js";
import { messageReferenceSchema } from "./types/MessageReference.js";
import { messageComponentSchema } from "./types/MessageComponent.js";
import { attachmentSchema } from "./types/Attachment.js";
import { messageFlag } from "./types/MessageFlag.js";

export const createMessageSchema = object({
  channel: snowflake,
  body: partial(
    object({
      /** Message contents (up to 2000 characters) */
      content: pipe(string(), minLength(0), maxLength(2000)),
      /** true if this is a TTS message */
      tts: boolean(),
      /** Embedded rich content (up to 6000 characters) */
      embeds: array(embedSchema),
      /** allowed mention object	Allowed mentions for the message */
      allowedMentions: allowedMentionSchema,
      /** Include to make your message a reply */
      messageReference: messageReferenceSchema,
      /** Components to include with the message */
      components: messageComponentSchema,
      /** IDs of up to 3 stickers in the server to send in the message */
      stickerIds: pipe(array(string()), maxLength(3)),
      /** Contents of the file being sent. See Uploading Files */
      files: unknown(),
      /** JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files */
      payloadJson: string(),
      /** Attachment objects with filename and description. See Uploading Files */
      attachments: array(partial(attachmentSchema)),
      /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
      flags: asInteger(messageFlag)
    })
  )
});

/**
 * ### [Create Message](https://discord.com/developers/docs/resources/channel#create-message)
 *
 * **POST** `/channels/:channel/messages`
 *
 * > [!WARNING]
 * >
 * > Discord may strip certain characters from message content, like invalid unicode characters or characters which cause unexpected message formatting. If you are passing user-generated strings into message content, consider sanitizing the data to prevent unexpected behavior and using `allowedMentions` to prevent unexpected mentions.
 *
 * Post a message to a guild text or DM channel. Returns a {@link Message | message object}. Fires a Message Create Gateway event. See message formatting for more information on how to properly format messages.
 *
 * To create a message as a reply to another message, apps can include a `messageReference` with a `message_id`. The `channelId` and `guildId` in the `messageReference` are optional, but will be validated if provided.
 *
 * Files must be attached using a `multipart/form-data` body as described in Uploading Files.
 *
 * Limitations
 *
 * - When operating on a guild channel, the current user must have the `SEND_MESSAGES` permission.
 * - When sending a message with `tts` (text-to-speech) set to `true`, the current user must have the `SEND_TTS_MESSAGES` permission.
 * - When creating a message as a reply to another message, the current user must have the `READ_MESSAGE_HISTORY` permission.
 *    - The referenced message must exist and cannot be a system message.
 * - The maximum request size when sending a message is **25 MiB**
 * - For the embed object, you can set every field except `type` (it will be `rich` regardless of if you try to set it), `provider`, `video`, and any `height`, `width`, or `proxyUrl` values for images.
 */
export const createMessage: Fetcher<
  typeof createMessageSchema,
  Message
> = async ({ channel, body }) => post(`/channels/${channel}/messages`, body);

export const createMessageSafe = toValidated(
  createMessage,
  createMessageSchema,
  messageSchema
);

export const createMessageProcedure = toProcedure(
  `mutation`,
  createMessage,
  createMessageSchema,
  messageSchema
);
