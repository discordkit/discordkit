import { dispatchEvent } from "../dispatch.js";
import type { MessagePollVote } from "./types/MessagePollVote.js";

/**
 * ### [Message Poll Vote Remove](https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove)
 *
 * Sent when a user retracts a poll vote. As with the add event, a multi-select
 * poll produces one event per answer.
 *
 * Gated by `GUILD_MESSAGE_POLLS` or `DIRECT_MESSAGE_POLLS`.
 */
export const onMessagePollVoteRemove = dispatchEvent<
  MessagePollVote,
  `MESSAGE_POLL_VOTE_REMOVE`
>(`MESSAGE_POLL_VOTE_REMOVE`, [`GUILD_MESSAGE_POLLS`, `DIRECT_MESSAGE_POLLS`]);
