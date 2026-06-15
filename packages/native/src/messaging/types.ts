import type { ChannelId, LobbyId, MessageId, UserId } from "../snowflake.js";
import type { User } from "../users/types.js";
import { CHANNEL_TYPE_BY_CODE, type ChannelType } from "../lobby/types.js";

/**
 * Public types for the messaging domain. Everything here is a read-only snapshot (the read-handle convention) — unlike a lobby, a message is NOT surfaced as a live wrapper: it has no interactive operations on the handle (you `editMessage`/`deleteMessage` via the client by id), and the SDK keeps only the 25 most recent per channel, so a one-time snapshot is the right model.
 *
 * `ChannelType` is shared with the lobby domain (channels are the same concept); re-exported here so messaging consumers don't reach into `../lobby`.
 */
export { CHANNEL_TYPE_BY_CODE, type ChannelType };

/** Metadata / moderation metadata on a message — string→string developer pairs. */
export type MessageMetadata = Record<string, string>;

/** The kind of non-text content a message carries, the public string form of `Discord_AdditionalContentType`. */
export type AdditionalContentType =
  | `other`
  | `attachment`
  | `poll`
  | `voiceMessage`
  | `thread`;

/** Maps the ABI's numeric `Discord_AdditionalContentType` to the public form. */
export const ADDITIONAL_CONTENT_TYPE_BY_CODE: Record<
  number,
  AdditionalContentType
> = {
  0: `other`,
  1: `attachment`,
  2: `poll`,
  3: `voiceMessage`,
  4: `thread`
};

/**
 * The auto-generated disclosure kind for a "fake" explanatory message the SDK injects the first time a user's message will appear on Discord. The public form of `Discord_DisclosureTypes` (the ABI defines a single value, 3).
 */
export type DisclosureType = `messageDataVisibleOnDiscord`;

/** Maps the ABI's numeric `Discord_DisclosureTypes` to the public form. */
export const DISCLOSURE_TYPE_BY_CODE: Record<number, DisclosureType> = {
  3: `messageDataVisibleOnDiscord`
};

/**
 * Non-text content in a message that likely can't render in game (images, videos, embeds, polls, …). Show a small notice + a way to view it on Discord rather than trying to render it (see {@link Message.additionalContent}).
 */
export interface AdditionalContent {
  /** The kind of additional content. */
  type: AdditionalContentType;
  /** How many pieces of additional content (e.g. "2 additional images"). */
  count: number;
  /** For a poll or thread, its title. */
  title?: string;
}

/** A snapshot of the channel a message was sent in. */
export interface Channel {
  /** The channel's id. */
  id: ChannelId;
  /** The channel's name (usually only server channels are named). */
  name: string;
  /** The channel's type — distinguishes DM / ephemeral DM / lobby / group DM. */
  type: ChannelType;
  /** For DMs/group DMs, the member user ids; empty for other channel types. */
  recipientIds: UserId[];
}

/** A snapshot of a DM conversation summary (`getUserMessageSummaries`). */
export interface UserMessageSummary {
  /** The other user in the DM. */
  userId: UserId;
  /** The id of the last message in the conversation. */
  lastMessageId: MessageId;
}

/**
 * A snapshot of a single message received by the SDK — a 1:1 DM, ephemeral DM, or lobby message. Read once; the SDK only retains the 25 most recent per channel.
 */
export interface Message {
  /** The message's id. */
  id: MessageId;
  /** The message content, with emoji/mention markup humanized (`@username`,
   * `:emoji:`). May be empty (e.g. a Discord message that's only an image). */
  content: string;
  /** The raw content, markup NOT humanized. */
  rawContent: string;
  /** The author's user id. */
  authorId: UserId;
  /** The author, if the SDK has their user handle. */
  author?: User;
  /** The channel id this message was sent in. */
  channelId: ChannelId;
  /** The channel, if the SDK has its handle. */
  channel?: Channel;
  /** When sent in a DM, the other user's id; else `0n`. */
  recipientId: UserId;
  /** The lobby id this message was sent in, if it was a lobby message. */
  lobbyId?: LobbyId;
  /** Whether the message was sent in-game (vs. from Discord itself). */
  sentFromGame: boolean;
  /** Sent time, ms since epoch. */
  sentTimestamp: bigint;
  /** Last edit time, ms since epoch; `0n` if never edited. */
  editedTimestamp: bigint;
  /** Developer metadata included with the message. */
  metadata: MessageMetadata;
  /** Developer moderation metadata set on the message. */
  moderationMetadata: MessageMetadata;
  /** Non-text content the game likely can't render, if any. */
  additionalContent?: AdditionalContent;
  /** If this is an SDK-injected disclosure message, its kind. */
  disclosureType?: DisclosureType;
}
