import type { ThreadMember } from "@discordkit/client/channel/types/ThreadMember";
import { dispatchEvent } from "../dispatch.js";

/**
 * The `THREAD_MEMBER_UPDATE` payload: a thread member plus the guild it's in.
 *
 * The docs specify "a thread member object **with an extra `guild_id` field**",
 * which the base resource doesn't carry — omitting it would make a field that
 * genuinely arrives look like a type error at the call site.
 */
export interface ThreadMemberUpdate extends ThreadMember {
  /** The guild the thread belongs to. */
  guildId: string;
}

/**
 * ### [Thread Member Update](https://discord.com/developers/docs/events/gateway-events#thread-member-update)
 *
 * Sent when the thread member object for the current user is updated. Documented
 * for completeness but unlikely to be needed by most bots — for a bot it's
 * largely just a signal that it is a member of the thread.
 *
 * Gated by `GUILDS`.
 */
export const onThreadMemberUpdate = dispatchEvent<
  ThreadMemberUpdate,
  `THREAD_MEMBER_UPDATE`
>(`THREAD_MEMBER_UPDATE`, [`GUILDS`]);
