import { z } from "zod";
import { sticker } from "../../sticker";
import { application } from "../../application";
import { reaction } from "../../emoji";
import { member } from "../../guild";
import { user } from "../../user";
import { channel } from "./Channel";
import { interactionType } from "./InteractionType";
import { messageActivity } from "./MessageActivity";
import { channelMention } from "./ChannelMention";
import { embed } from "./Embed";
import { messageReference } from "./MessageReference";
import { attachment } from "./Attachment";
import { messageFlag } from "./MessageFlag";

const baseMessage = z.object({
  /** id of the message */
  id: z.string(),
  /** id of the channel the message was sent in */
  channelId: z.string(),
  /** user object	the author of this message (not guaranteed to be a valid user, see below) */
  author: user.optional(),
  /** contents of the message */
  content: z.string(),
  /** when this message was sent */
  timestamp: z.string(),
  /** when this message was edited (or null if never) */
  editedTimestamp: z.string().optional(),
  /** whether this was a TTS message */
  tts: z.boolean(),
  /** whether this message mentions everyone */
  mentionEveryone: z.boolean(),
  /** users specifically mentioned in the message */
  mentions: user.array(),
  /** roles specifically mentioned in this message */
  mentionRoles: z.string().array(),
  /** channels specifically mentioned in this message */
  mentionChannels: channelMention.array().optional(),
  /** any attached files */
  attachments: attachment.array().optional(),
  /** any embedded content */
  embeds: embed.array().optional(),
  /** reactions to the message */
  reactions: reaction.array().optional(),
  /** used for validating a message was sent */
  nonce: z.union([z.number(), z.string()]).optional(),
  /** whether this message is pinned */
  pinned: z.boolean(),
  /** if the message is generated by a webhook, this is the webhook's id */
  webhookId: z.string(),
  /** type of message */
  type: z.number(),
  /** sent with Rich Presence-related chat embeds */
  activity: messageActivity.optional(),
  /** sent with Rich Presence-related chat embeds */
  application: application.optional(),
  /** if the message is an Interaction or application-owned webhook, this is the id of the application */
  applicationId: z.string().optional(),
  /** data showing the source of a crosspost, channel follow add, pin, or reply message */
  messageReference: messageReference.optional(),
  /** message flags combined as a bitfield */
  flags: messageFlag.optional(),
  /** sent if the message is a response to an Interaction */
  interaction: z
    .object({
      /** id of the interaction */
      id: z.string(),
      /** the type of interaction */
      type: interactionType,
      /** the name of the application command */
      name: z.string(),
      /** the user who invoked the interaction */
      user: user.partial(),
      /** the member who invoked the interaction in the guild */
      member: member.partial().optional()
    })
    .optional(),
  /** the thread that was started from this message, includes thread member object */
  thread: channel.optional(),
  /** sent if the message contains components like buttons, action rows, or other interactive components */
  //components?: MessageComponent[];
  /** sent if the message contains stickers */
  stickerItems: sticker.array().optional()
});

export const message = baseMessage.extend({
  /** the message associated with the message_reference */
  referencedMessage: z.lazy(() => baseMessage).optional()
});

export type Message = z.infer<typeof message>;
