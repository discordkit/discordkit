import { dispatchEvent } from "../dispatch.js";
import type { ThreadListSync } from "./types/ChannelEvents.js";

/**
 * ### [Thread List Sync](https://discord.com/developers/docs/events/gateway-events#thread-list-sync)
 *
 * Sent when the current user gains access to a channel. An absent `channelIds` covers the whole guild.
 *
 * Gated by `GUILDS`.
 */
export const onThreadListSync = dispatchEvent<
  ThreadListSync,
  `THREAD_LIST_SYNC`
>(`THREAD_LIST_SYNC`);
