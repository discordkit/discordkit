import * as v from "valibot";
import {
  get,
  type Fetcher,
  snowflake,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { type Message, messageSchema } from "./types/Message.js";
import { type Channel, channelSchema } from "../channel/types/Channel.js";
import {
  type ThreadMember,
  threadMemberSchema
} from "../channel/types/ThreadMember.js";

/**
 * Picklists are inline to this endpoint — they appear only as filter values
 * for the search and aren't reused elsewhere. All accept a leading `-` to
 * negate the filter (e.g. `"-bot"` excludes bot-authored messages).
 */
const authorType = v.picklist([
  `user`,
  `bot`,
  `webhook`,
  `-user`,
  `-bot`,
  `-webhook`
]);

const hasType = v.picklist([
  `image`,
  `sound`,
  `video`,
  `file`,
  `sticker`,
  `embed`,
  `link`,
  `poll`,
  `snapshot`,
  `-image`,
  `-sound`,
  `-video`,
  `-file`,
  `-sticker`,
  `-embed`,
  `-link`,
  `-poll`,
  `-snapshot`
]);

const embedType = v.picklist([`image`, `video`, `gif`, `sound`, `article`]);

const sortBy = v.picklist([`timestamp`, `relevance`]);
const sortOrder = v.picklist([`asc`, `desc`]);

export const searchGuildMessagesSchema = v.object({
  guild: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Max number of messages to return (1-25, default 25) */
        limit: boundedInteger({ min: 1, max: 25 }),
        /** Number to offset the returned messages by (max 9975) */
        offset: boundedInteger({ min: 0, max: 9975 }),
        /** Get messages before this message ID */
        maxId: snowflake,
        /** Get messages after this message ID */
        minId: snowflake,
        /** Max number of words to skip between matching tokens in the search `content` (max 100, default 2) */
        slop: boundedInteger({ min: 0, max: 100 }),
        /** Filter messages by content (max 1024 characters) */
        content: boundedString({ max: 1024 }),
        /** Filter messages by these channels (max 500) */
        channelId: v.pipe(v.array(snowflake), v.maxLength(500)),
        /** Filter messages by author type */
        authorType: v.array(authorType),
        /** Filter messages by these authors (max 100) */
        authorId: v.pipe(v.array(snowflake), v.maxLength(100)),
        /** Filter messages that mention these users (max 100) */
        mentions: v.pipe(v.array(snowflake), v.maxLength(100)),
        /** Filter messages that mention these roles (max 100) */
        mentionsRoleId: v.pipe(v.array(snowflake), v.maxLength(100)),
        /** Filter messages that do or do not mention @everyone */
        mentionEveryone: v.boolean(),
        /** Filter messages that reply to these users (max 100) */
        repliedToUserId: v.pipe(v.array(snowflake), v.maxLength(100)),
        /** Filter messages that reply to these messages (max 100) */
        repliedToMessageId: v.pipe(v.array(snowflake), v.maxLength(100)),
        /** Filter messages by whether they are or are not pinned */
        pinned: v.boolean(),
        /** Filter messages by whether or not they have specific things */
        has: v.array(hasType),
        /** Filter messages by embed type */
        embedType: v.array(embedType),
        /** Filter messages by embed provider (case-sensitive, e.g. `Tenor`) (max 256 characters, max 100) */
        embedProvider: v.pipe(
          v.array(boundedString({ max: 256 })),
          v.maxLength(100)
        ),
        /** Filter messages by link hostname (e.g. `discordapp.com`) (max 256 characters, max 100) */
        linkHostname: v.pipe(
          v.array(boundedString({ max: 256 })),
          v.maxLength(100)
        ),
        /** Filter messages by attachment filename (max 1024 characters, max 100) */
        attachmentFilename: v.pipe(
          v.array(boundedString({ max: 1024 })),
          v.maxLength(100)
        ),
        /** Filter messages by attachment extension (e.g. `txt`) (max 256 characters, max 100) */
        attachmentExtension: v.pipe(
          v.array(boundedString({ max: 256 })),
          v.maxLength(100)
        ),
        /** The sorting algorithm to use. Note: sort order is not respected when sorting by relevance. */
        sortBy,
        /** The direction to sort (`asc` or `desc`, default `desc`) */
        sortOrder,
        /** Whether to include results from age-restricted channels (default false) */
        includeNsfw: v.boolean()
      })
    )
  )
});

export const searchGuildMessagesResponseSchema = v.object({
  /** Whether the guild is undergoing a deep historical indexing operation */
  doingDeepHistoricalIndex: v.boolean(),
  /** The number of documents that have been indexed during the current index operation, if any */
  documentsIndexed: v.exactOptional(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** The total number of results that match the query */
  totalResults: v.pipe(v.number(), v.integer(), v.minValue(0)),
  /**
   * A nested array of messages that match the query. The nested shape was
   * historically used to provide surrounding context to each match, but
   * Discord no longer returns context — each inner array now contains a
   * single message.
   */
  messages: v.array(v.array(messageSchema)),
  /** The threads that contain the returned messages */
  threads: v.exactOptional(v.array(channelSchema)),
  /** A thread member object for each returned thread the current user has joined */
  members: v.exactOptional(v.array(threadMemberSchema))
});

export interface SearchGuildMessagesResponse extends v.InferOutput<
  typeof searchGuildMessagesResponseSchema
> {}

// Re-export the imported types so consumers don't have to chase down their
// origin packages when reading the response shape.
export type { Channel, Message, ThreadMember };

/**
 * ### [Search Guild Messages](https://discord.com/developers/docs/resources/message#search-guild-messages)
 *
 * **GET** `/guilds/:guild/messages/search`
 *
 * Returns a list of messages without the `reactions` key that match a
 * search query in the guild. Requires the `READ_MESSAGE_HISTORY` permission.
 *
 * > [!WARNING]
 * >
 * > This endpoint is restricted according to whether the `MESSAGE_CONTENT`
 * > Privileged Intent is enabled for your application.
 *
 * > [!WARNING]
 * >
 * > If the entity you are searching is not yet indexed, the endpoint will
 * > return a `202 Accepted` response with a body resembling an error
 * > (`{ message, code: 110000, documents_indexed, retry_after }`) and no
 * > search results. Retry after the timeframe in `retryAfter`.
 *
 * > [!NOTE]
 * >
 * > Due to speed optimizations, search may return slightly fewer results
 * > than the limit specified when messages have not been accessed for a
 * > long time. Clients should not rely on the length of the `messages`
 * > array to paginate results. When messages are being created or deleted,
 * > `totalResults` may not be accurate.
 */
export const searchGuildMessages: Fetcher<
  typeof searchGuildMessagesSchema,
  SearchGuildMessagesResponse
> = async ({ guild, params }) =>
  get(`/guilds/${guild}/messages/search`, params);
