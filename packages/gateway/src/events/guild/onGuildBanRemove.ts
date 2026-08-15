import { dispatchEvent } from "../dispatch.js";
import type { GuildBan } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Ban Remove](https://discord.com/developers/docs/events/gateway-events#guild-ban-remove)
 *
 * Sent when a user is unbanned from a guild.
 *
 * Gated by `GUILD_MODERATION`.
 */
export const onGuildBanRemove = dispatchEvent<GuildBan, `GUILD_BAN_REMOVE`>(
  `GUILD_BAN_REMOVE`
);
