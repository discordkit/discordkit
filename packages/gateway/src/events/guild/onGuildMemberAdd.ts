import { dispatchEvent } from "../dispatch.js";
import type { GuildMemberAdd } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Member Add](https://discord.com/developers/docs/events/gateway-events#guild-member-add)
 *
 * Sent when a user joins a guild. May also fire for users who are already members.
 *
 * Gated by `GUILD_MEMBERS`.
 */
export const onGuildMemberAdd = dispatchEvent<
  GuildMemberAdd,
  `GUILD_MEMBER_ADD`
>(`GUILD_MEMBER_ADD`);
