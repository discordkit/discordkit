import { dispatchEvent } from "../dispatch.js";
import type { ThreadMembersUpdate } from "./types/ChannelEvents.js";

/**
 * ### [Thread Members Update](https://discord.com/developers/docs/events/gateway-events#thread-members-update)
 *
 * Sent when anyone is added to or removed from a thread. `memberCount` is capped at 50.
 *
 * Gated by `GUILDS`; `addedMembers` additionally needs the privileged `GUILD_MEMBERS` intent.
 */
export const onThreadMembersUpdate = dispatchEvent<
  ThreadMembersUpdate,
  `THREAD_MEMBERS_UPDATE`
>(`THREAD_MEMBERS_UPDATE`);
