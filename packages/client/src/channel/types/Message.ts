import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { stickerSchema } from "../../sticker/types/Sticker.ts";
import { applicationSchema } from "../../application/types/Application.ts";
import { userSchema } from "../../user/types/User.ts";
import { reactionSchema } from "./Reaction.ts";
import { channelSchema } from "./Channel.ts";
import { messageActivitySchema } from "./MessageActivity.ts";
import { channelMentionSchema } from "./ChannelMention.ts";
import { embedSchema } from "./Embed.ts";
import { messageReferenceSchema } from "./MessageReference.ts";
import { attachmentSchema } from "./Attachment.ts";
import { messageTypeSchema } from "./MessageType.ts";
import { messageInteractionSchema } from "./MessageInteraction.ts";
import { messageComponentSchema } from "./MessageComponent.ts";
import { roleSubscriptionDataSchema } from "./RoleSubscriptionData.ts";

const baseMessageSchema = z.object({
  /** id of the message */
  id: snowflake,
  /** id of the channel the message was sent in */
  channelId: snowflake,
  /** user object	the author of this message (not guaranteed to be a valid user, see below) */
  author: userSchema,
  /** contents of the message */
  content: z.string(),
  /** when this message was sent */
  timestamp: z.string().datetime(),
  /** when this message was edited (or null if never) */
  editedTimestamp: z.string().datetime().optional(),
  /** whether this was a TTS message */
  tts: z.boolean(),
  /** whether this message mentions everyone */
  mentionEveryone: z.boolean(),
  /** users specifically mentioned in the message */
  mentions: userSchema.array(),
  /** roles specifically mentioned in this message */
  mentionRoles: z.string().min(1).array(),
  /** channels specifically mentioned in this message */
  mentionChannels: channelMentionSchema.array().nullable(),
  /** any attached files */
  attachments: attachmentSchema.array(),
  /** any embedded content */
  embeds: embedSchema.array(),
  /** reactions to the message */
  reactions: reactionSchema.array().nullable(),
  /** used for validating a message was sent */
  nonce: z.union([z.number(), z.string()]).nullable(),
  /** whether this message is pinned */
  pinned: z.boolean(),
  /** if the message is generated by a webhook, this is the webhook's id */
  webhookId: snowflake.nullable(),
  /** type of message */
  type: messageTypeSchema,
  /** sent with Rich Presence-related chat embeds */
  activity: messageActivitySchema.nullable(),
  /** sent with Rich Presence-related chat embeds */
  application: applicationSchema.partial().nullable(),
  /** if the message is an Interaction or application-owned webhook, this is the id of the application */
  applicationId: snowflake.nullable(),
  /** data showing the source of a crosspost, channel follow add, pin, or reply message */
  messageReference: messageReferenceSchema.nullable(),
  /** message flags combined as a bitfield */
  flags: z.number().int().positive().nullable(),
  /** sent if the message is a response to an Interaction */
  interaction: messageInteractionSchema.nullable(),
  /** the thread that was started from this message, includes thread member object */
  thread: channelSchema.nullable(),
  /** sent if the message contains components like buttons, action rows, or other interactive components */
  components: messageComponentSchema.array().nullable(),
  /** sent if the message contains stickers */
  stickerItems: stickerSchema.array().nullable(),
  /** @deprecated the stickers sent with the message */
  stickers: stickerSchema.array().nullable(),
  /** A generally increasing integer (there may be gaps or duplicates) that represents the approximate position of the message in a thread, it can be used to estimate the relative position of the message in a thread in company with totalMessageSent on parent thread */
  position: z.number().int(),
  /** data of the role subscription purchase or renewal that prompted this `ROLE_SUBSCRIPTION_PURCHASE` message */
  roleSubscriptionData: roleSubscriptionDataSchema.nullable(),
  /** data for users, members, channels, and roles in the message's auto-populated select menus */
  resolved: z.unknown().nullable() // Must be unknown because of cyclical dependency
});

export const messageSchema = baseMessageSchema.extend({
  /** the message associated with the message_reference */
  referencedMessage: z.lazy(() => baseMessageSchema).optional()
});

export type Message = z.infer<typeof messageSchema>;
