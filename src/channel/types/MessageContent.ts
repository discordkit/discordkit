import { z } from "zod";
import { allowedMention } from "./AllowedMention";
import { attachment } from "./Attachment";
import { embed } from "./Embed";
import { messageFlag } from "./MessageFlag";
import { messageReference } from "./MessageReference";

export const messageContent = z
  .object({
    /** Message contents (up to 2000 characters) */
    content: z.string().min(0).max(2000),
    /** true if this is a TTS message */
    tts: z.boolean(),
    /** Embedded rich content (up to 6000 characters) */
    embeds: embed.array(),
    /** allowed mention object	Allowed mentions for the message */
    allowedMentions: allowedMention,
    /** Include to make your message a reply */
    messageReference,
    /** Components to include with the message */
    components: z.unknown().array(),
    /** IDs of up to 3 stickers in the server to send in the message */
    stickerIds: z.string().array().max(3),
    /** Contents of the file being sent. See Uploading Files */
    files: z.unknown(),
    /** JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files */
    payloadJson: z.string(),
    /** Attachment objects with filename and description. See Uploading Files */
    attachments: attachment.partial().array(),
    /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
    flags: messageFlag
  })
  .partial();

export type MessageContent = z.infer<typeof messageContent>;
