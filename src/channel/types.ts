/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { z } from "zod";
import type { Sticker } from "../sticker/types";
import type { Application } from "../application/types";
import type { Reaction } from "../emoji/types";
import type { Member } from "../guild/types";
import type { User } from "../user/types";
import { user } from "../user/types";

export const autoArchiveDuration = z.union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)]);

export type AutoArchiveDuration = z.infer<typeof autoArchiveDuration>;

// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
export enum ChannelType {
  /** a text channel within a server */
  GUILD_TEXT = 0,
  /** a direct message between users */
  DM = 1,
  /** a voice channel within a server */
  GUILD_VOICE = 2,
  /** a direct message between multiple users */
  GROUP_DM = 3,
  /** an organizational category that contains up to 50 channels */
  GUILD_CATEGORY = 4,
  /** a channel that users can follow and crosspost into their own server */
  GUILD_NEWS = 5,
  /** a temporary sub-channel within a GUILD_NEWS channel */
  GUILD_NEWS_THREAD = 10,
  /** a temporary sub-channel within a GUILD_TEXT channel */
  GUILD_PUBLIC_THREAD = 11,
  /** a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission */
  GUILD_PRIVATE_THREAD = 12,
  /** a voice channel for hosting events with an audience */
  GUILD_STAGE_VOICE = 13,
  /** the channel in a hub containing the listed servers */
  GUILD_DIRECTORY = 14,
  /** a channel that can only contain threads */
  GUILD_FORUM = 15
}

// https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
export const overwrite = z.object({
  /** role or user id */
  id: z.string().min(1),
  /** either 0 (role) or 1 (member) */
  type: z.union([z.literal(0), z.literal(1)]),
  /** permission bit set */
  allow: z.string().min(1),
  /** permission bit set */
  deny: z.string().min(1)
});

export type Overwrite = z.infer<typeof overwrite>;

export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  AUTO = 1,
  /** 720p */
  FULL = 2
}

export const thread = z.object({
  /** whether the thread is archived */
  archived: z.boolean(),
  /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  autoArchiveDuration,
  /** timestamp when the thread's archive status was last changed, used for calculating recent activity */
  archiveTimestamp: z.number(),
  /** whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it */
  locked: z.boolean(),
  /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
  invitable: z.boolean().optional(),
  /** timestamp when the thread was created; only populated for threads created after 2022-01-09 */
  createTimestamp: z.number().optional()
});

export type Thread = z.infer<typeof thread>;

export const threadMember = z.object({
  /** the id of the thread */
  id: z.string().min(1).optional(),
  /** the id of the user */
  userId: z.string().min(1).optional(),
  /** the time the current user last joined the thread */
  joinTimestamp: z.number(),
  /** any user-thread settings, currently only used for notifications */
  flags: z.number()
});

export type ThreadMember = z.infer<typeof threadMember>;

// https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
export const channel = z.object({
  /** the id of this channel */
  id: z.string().min(1),
  /** the type of channel */
  type: z.nativeEnum(ChannelType),
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guildId: z.string().min(1).optional(),
  /** sorting position of the channel */
  position: z.number().positive().optional(),
  /** explicit permission overwrites for members and roles */
  permissionOverwrites: z.array(overwrite).optional(),
  /** the name of the channel (1-100 characters) */
  name: z.string().min(1).max(100).optional(),
  /** the channel topic (0-1024 characters) */
  topic: z.string().min(0).max(1024).optional(),
  /** whether the channel is nsfw */
  nsfw: z.boolean().optional(),
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  lastMessageId: z.string().min(1).optional(),
  /** the bitrate (in bits) of the voice channel */
  bitrate: z.number().positive().optional(),
  /** the user limit of the voice channel */
  userLimit: z.number().positive().optional(),
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected */
  rateLimitPerUser: z.number().min(0).max(21600).optional(),
  /** the recipients of the DM */
  recipients: z.array(user).optional(),
  /** icon hash of the group DM */
  icon: z.string().min(1).optional(),
  /** id of the creator of the group DM or thread */
  ownerId: z.string().min(1).optional(),
  /** application id of the group DM creator if it is bot-created */
  applicationId: z.string().min(1).optional(),
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parentId: z.string().min(1).max(50).optional(),
  /** when the last pinned message was pinned. This may be null in events such as GUILD_CREATE when a message is not pinned. */
  lastPinTimestamp: z.number().optional(),
  /** voice region id for the voice channel, automatic when set to null */
  rtcRegion: z.string().min(1).optional(),
  /** the camera video quality mode of the voice channel, 1 when not present */
  videoQualityMode: z.nativeEnum(VideoQualityMode).optional(),
  /** an approximate count of messages in a thread, stops counting at 50 */
  messageCount: z.number().optional(),
  /** an approximate count of users in a thread, stops counting at 50 */
  memberCount: z.number().optional(),
  /** thread-specific fields not needed by other channels */
  threadMetadata: thread.optional(),
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member: threadMember.optional(),
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  defaultAutoArchiveDuration: autoArchiveDuration.optional(),
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions: z.string().min(1).optional()
});

export type Channel = z.infer<typeof channel>;

export interface ChannelMention {
  /** id of the channel */
  id: string;
  /** id of the guild containing the channel */
  guildId: string;
  /** the type of channel */
  type: ChannelType;
  /** the name of the channel */
  name: string;
}

export const embedType = z.enum([
  /** generic embed rendered from embed attributes */
  `rich`,
  /** image embed */
  `image`,
  /** video embed */
  `video`,
  /** animated gif image embed rendered as a video embed */
  `gifv`,
  /** article embed */
  `article`,
  /** link embed */
  `link`
]);

export type EmbedType = z.infer<typeof embedType>;

export const embed = z
  .object({
    /** title of embed */
    title: z.string(),
    /** type of embed (always "rich" for webhook embeds) */
    type: embedType,
    /** description of embed */
    description: z.string(),
    /** url of embed */
    url: z.string(),
    /** timestamp of embed content */
    timestamp: z.string(),
    /** color code of the embed */
    color: z.number(),
    /** footer information */
    footer: z.object({
      /** footer text */
      text: z.string(),
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: z.string().optional(),
      /**	a proxied url of footer icon */
      proxyIconUrl: z.string().optional()
    }),
    /** image information */
    image: z.object({
      /** source url of image (only supports http(s) and attachments) */
      url: z.string(),
      /** a proxied url of the image */
      proxyUrl: z.string().optional(),
      /** height of image */
      height: z.number().optional(),
      /** width of image */
      width: z.number().optional()
    }),
    /** thumbnail information */
    thumbnail: z.object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url: z.string(),
      /** a proxied url of the thumbnail */
      proxyUrl: z.string().optional(),
      /** height of thumbnail */
      height: z.number().optional(),
      /** width of thumbnail */
      width: z.number().optional()
    }),
    /** video information */
    video: z.object({
      /** source url of video */
      url: z.string(),
      /** a proxied url of the video */
      proxyUrl: z.string().optional(),
      /** height of video */
      height: z.number().optional(),
      /** width of video */
      width: z.number().optional()
    }),
    /** provider information */
    provider: z
      .object({
        /** name of provider */
        name: z.string(),
        /** url of provider */
        url: z.string()
      })
      .partial(),
    /** author information */
    author: z.object({
      /** name of author */
      name: z.string(),
      /** url of author */
      url: z.string().optional(),
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: z.string().optional(),
      /** a proxied url of author icon */
      proxyIconUrl: z.string().optional()
    }),
    /** fields information */
    fields: z.array(
      z.object({
        /** name of the field */
        name: z.string(),
        /** value of the field */
        value: z.string(),
        /** whether or not this field should display inline */
        inline: z.boolean().optional()
      })
    )
  })
  .partial();

export type Embed = z.infer<typeof embed>;

export const allowedMention = z.object({
  /** An array of allowed mention types to parse from the content. */
  parse: z.array(z.enum([`role`, `users`, `everyone`])),
  /** Array of role_ids to mention (Max size of 100) */
  roles: z.array(z.string()).max(100),
  /** Array of user_ids to mention (Max size of 100) */
  users: z.array(z.string()).max(100),
  /** For replies, whether to mention the author of the message being replied to (default false) */
  repliedUser: z.boolean().optional()
});

export type AllowedMention = z.infer<typeof allowedMention>;

export const messageReference = z
  .object({
    /** id of the originating message */
    messageId: z.string().min(1),
    /** id of the originating message's channel */
    channelId: z.string().min(1),
    /** id of the originating message's guild */
    guildId: z.string().min(1),
    /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
    failIfNotExists: z.boolean()
  })
  .partial();

export type MessageReference = z.infer<typeof messageReference>;

export const attachment = z.object({
  /** attachment id */
  id: z.string(),
  /** name of file attached */
  filename: z.string(),
  /** description for the file */
  description: z.string().optional(),
  /** the attachment's media type */
  contentType: z.string(),
  /** size of file in bytes */
  size: z.number(),
  /** source url of file */
  url: z.string(),
  /** a proxied url of file */
  proxyUrl: z.string(),
  /** height of file (if image) */
  height: z.number().optional(),
  /** 	width of file (if image) */
  width: z.number().optional(),
  /** whether this attachment is ephemeral */
  ephemeral: z.boolean().optional()
});

export type Attachment = z.infer<typeof attachment>;

export enum MessageFlag {
  /** this message has been published to subscribed channels (via Channel Following) */
  CROSSPOSTED = 1 << 0,
  /** this message originated from a message in another channel (via Channel Following) */
  IS_CROSSPOST = 1 << 1,
  /** do not include any embeds when serializing this message */
  SUPPRESS_EMBEDS = 1 << 2,
  /** the source message for this crosspost has been deleted (via Channel Following) */
  SOURCE_MESSAGE_DELETED = 1 << 3,
  /** this message came from the urgent message system */
  URGENT = 1 << 4,
  /** this message has an associated thread, with the same id as the message */
  HAS_THREAD = 1 << 5,
  /** this message is only visible to the user who invoked the Interaction */
  EPHEMERAL = 1 << 6,
  /** this message is an Interaction Response and the bot is "thinking" */
  LOADING = 1 << 7,
  /** this message failed to mention some roles and add their members to the thread */
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8
}

export const messageContent = z
  .object({
    /** Message contents (up to 2000 characters) */
    content: z.string().min(0).max(2000),
    /** true if this is a TTS message */
    tts: z.boolean(),
    /** Embedded rich content (up to 6000 characters) */
    embeds: z.array(embed),
    /** allowed mention object	Allowed mentions for the message */
    allowedMentions: allowedMention,
    /** Include to make your message a reply */
    messageReference,
    /** Components to include with the message */
    components: z.array(z.unknown()),
    /** IDs of up to 3 stickers in the server to send in the message */
    stickerIds: z.array(z.string()).max(3),
    /** Contents of the file being sent. See Uploading Files */
    files: z.unknown(),
    /** JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files */
    payloadJson: z.string(),
    /** Attachment objects with filename and description. See Uploading Files */
    attachments: z.array(attachment.partial()),
    /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS can be set) */
    flags: z.nativeEnum(MessageFlag)
  })
  .partial();

export type MessageContent = z.infer<typeof messageContent>;

export interface Message {
  /** id of the message */
  id: string;
  /** id of the channel the message was sent in */
  channelId: string;
  /** user object	the author of this message (not guaranteed to be a valid user, see below) */
  author?: User;
  /** contents of the message */
  content: string;
  /** when this message was sent */
  timestamp: string;
  /** when this message was edited (or null if never) */
  editedTimestamp?: string;
  /** whether this was a TTS message */
  tts: boolean;
  /** whether this message mentions everyone */
  mentionEveryone: boolean;
  /** users specifically mentioned in the message */
  mentions: User[];
  /** roles specifically mentioned in this message */
  mentionRoles: string[];
  /** channels specifically mentioned in this message */
  mentionChannels?: ChannelMention[];
  /** any attached files */
  attachments?: Attachment[];
  /** any embedded content */
  embeds?: Embed[];
  /** reactions to the message */
  reactions?: Reaction[];
  /** used for validating a message was sent */
  nonce?: number | string;
  /** whether this message is pinned */
  pinned: boolean;
  /** if the message is generated by a webhook, this is the webhook's id */
  webhookId?: string;
  /** type of message */
  type: number;
  /** sent with Rich Presence-related chat embeds */
  activity?: MessageActivity;
  /** sent with Rich Presence-related chat embeds */
  application?: Application;
  /** if the message is an Interaction or application-owned webhook, this is the id of the application */
  applicationId?: string;
  /** data showing the source of a crosspost, channel follow add, pin, or reply message */
  messageReference?: MessageReference;
  /** message flags combined as a bitfield */
  flags?: MessageFlag;
  /** the message associated with the message_reference */
  referencedMessage?: Message;
  /** sent if the message is a response to an Interaction */
  interaction?: {
    /** id of the interaction */
    id: string;
    /** the type of interaction */
    type: InteractionType;
    /** the name of the application command */
    name: string;
    /** the user who invoked the interaction */
    user: Partial<User>;
    /** the member who invoked the interaction in the guild */
    member?: Partial<Member>;
  };
  /** the thread that was started from this message, includes thread member object */
  thread?: Channel;
  /** sent if the message contains components like buttons, action rows, or other interactive components */
  //components?: MessageComponent[];
  /** sent if the message contains stickers */
  stickerItems?: Sticker[];
}

export interface MessageActivity {
  /** type of message activity */
  type: MessageActivityType;
  /** party_id from a Rich Presence event */
  partyId?: string;
}

export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5
}

export interface FollowedChannel {
  /** source channel id */
  channelId: string;
  /** created target webhook id */
  webhookId: string;
}

export interface ArchivedThreads {
  /** the archived threads */
  threads: Channel[];
  /** a thread member object for each returned thread the current user has joined */
  members: ThreadMember[];
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: boolean;
}
