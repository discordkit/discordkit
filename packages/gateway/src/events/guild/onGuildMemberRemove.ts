import { dispatchEvent } from "../dispatch.js";
import type { GuildMemberRemove } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Member Remove](https://discord.com/developers/docs/events/gateway-events#guild-member-remove)
 *
 * Sent when a user leaves or is removed from a guild. Only the user survives — roles and nickname are gone unless cached.
 *
 * Gated by `GUILD_MEMBERS`.
 */
export const onGuildMemberRemove = dispatchEvent<
  GuildMemberRemove,
  `GUILD_MEMBER_REMOVE`
>(`GUILD_MEMBER_REMOVE`, [`GUILD_MEMBERS`]);
