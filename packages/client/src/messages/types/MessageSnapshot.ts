import type { InferOutput } from "valibot";
import {
  array,
  exactOptional,
  isoTimestamp,
  nullable,
  object,
  pipe,
  string
} from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { userSchema } from "../../user/types/User.js";
import { attachmentSchema } from "./Attachment.js";
import { embedSchema } from "./Embed.js";
import { messageComponentSchema } from "./MessageComponent.js";
import { messageFlag } from "./MessageFlag.js";
import { messageTypeSchema } from "./MessageType.js";

export const messageSnapshotSchema = object({
  message: object({
    /** type of message */
    type: messageTypeSchema,
    /** contents of the message */
    content: string(),
    /** any embedded content */
    embeds: array(embedSchema),
    /** any attached files */
    attachments: array(attachmentSchema),
    /** when this message was sent */
    timestamp: pipe(string(), isoTimestamp()),
    /** when this message was edited (or null if never) */
    editedTimestamp: nullable(pipe(string(), isoTimestamp())),
    /** message flags combined as a bitfield */
    flags: asInteger(messageFlag),
    /** users specifically mentioned in the message */
    mentions: array(userSchema),
    /** roles specifically mentioned in this message */
    mentionRoles: array(snowflake),
    /** @deprecated the stickers sent with the message */
    stickers: exactOptional(array(stickerSchema)),
    /** sent if the message contains stickers */
    stickerItems: exactOptional(array(stickerSchema)),
    /** sent if the message contains components like buttons, action rows, or other interactive components */
    components: exactOptional(array(messageComponentSchema))
  })
});

export type MessageSnapshot = InferOutput<typeof messageSnapshotSchema>;
