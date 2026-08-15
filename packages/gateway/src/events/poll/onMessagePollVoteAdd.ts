import { dispatchEvent } from "../dispatch.js";
import type { MessagePollVote } from "./types/MessagePollVote.js";

/**
 * ### [Message Poll Vote Add](https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add)
 *
 * Sent when a user votes on a poll. On a multi-select poll Discord sends **one
 * event per answer**, so a single voter can produce several.
 *
 * Gated by `GUILD_MESSAGE_POLLS` or `DIRECT_MESSAGE_POLLS`.
 */
export const onMessagePollVoteAdd = dispatchEvent<
  MessagePollVote,
  `MESSAGE_POLL_VOTE_ADD`
>(`MESSAGE_POLL_VOTE_ADD`);
