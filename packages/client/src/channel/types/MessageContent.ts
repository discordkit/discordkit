import {
  object,
  string,
  minLength,
  maxLength,
  boolean,
  array,
  unknown,
  partial,
  number,
  integer,
  type Output
} from "valibot";
import { allowedMentionSchema } from "./AllowedMention.js";
import { attachmentSchema } from "./Attachment.js";
import { embedSchema } from "./Embed.js";
import { messageReferenceSchema } from "./MessageReference.js";
import { messageComponentSchema } from "./MessageComponent.js";

export const messageContentSchema = partial(
  object({
    /** Message contents (up to 2000 characters) */
    content: string([minLength(0), maxLength(2000)]),
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
    stickerIds: array(string(), [maxLength(3)]),
    /** Contents of the file being sent. See Uploading Files */
    files: unknown(),
    /** JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files */
    payloadJson: string(),
    /** Attachment objects with filename and description. See Uploading Files */
    attachments: array(partial(attachmentSchema)),
    /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
    flags: number([integer()])
  })
);

export type MessageContent = Output<typeof messageContentSchema>;
