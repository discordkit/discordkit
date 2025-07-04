import * as v from "valibot";
import { asInteger, snowflake, timestamp } from "@discordkit/core";
import { stickerSchema } from "../../sticker/types/Sticker.js";
import { userSchema } from "../../user/types/User.js";
import { attachmentSchema } from "./Attachment.js";
import { embedSchema } from "./Embed.js";
import { messageComponentSchema } from "./MessageComponent.js";
import { messageFlag } from "./MessageFlag.js";
import { messageTypeSchema } from "./MessageType.js";

export const messageSnapshotSchema = v.object({
  message: v.object({
    /** type of message */
    type: messageTypeSchema,
    /** contents of the message */
    content: v.string(),
    /** any embedded content */
    embeds: v.array(embedSchema),
    /** any attached files */
    attachments: v.array(attachmentSchema),
    /** when this message was sent */
    timestamp: timestamp,
    /** when this message was edited (or null if never) */
    editedTimestamp: v.nullable(timestamp),
    /** message flags combined as a bitfield */
    flags: asInteger(messageFlag),
    /** users specifically mentioned in the message */
    mentions: v.array(userSchema),
    /** roles specifically mentioned in this message */
    mentionRoles: v.array(snowflake),
    /** @deprecated the stickers sent with the message */
    stickers: v.exactOptional(v.array(stickerSchema)),
    /** sent if the message contains stickers */
    stickerItems: v.exactOptional(v.array(stickerSchema)),
    /** sent if the message contains components like buttons, action rows, or other interactive components */
    components: v.exactOptional(v.array(messageComponentSchema))
  })
});

export interface MessageSnapshot
  extends v.InferOutput<typeof messageSnapshotSchema> {}
