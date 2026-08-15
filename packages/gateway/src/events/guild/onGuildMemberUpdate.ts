import { dispatchEvent } from "../dispatch.js";
import type { GuildMemberUpdate } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Member Update](https://discord.com/developers/docs/events/gateway-events#guild-member-update)
 *
 * Sent when a guild member is updated. Note this is a flattened payload of its own, not a member object with extras.
 *
 * Gated by `GUILD_MEMBERS`.
 */
export const onGuildMemberUpdate = dispatchEvent<
  GuildMemberUpdate,
  `GUILD_MEMBER_UPDATE`
>(`GUILD_MEMBER_UPDATE`);
