import { dispatchEvent } from "../dispatch.js";
import type { GuildBan } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Ban Add](https://discord.com/developers/docs/events/gateway-events#guild-ban-add)
 *
 * Sent when a user is banned from a guild.
 *
 * Gated by `GUILD_MODERATION`.
 */
export const onGuildBanAdd = dispatchEvent<GuildBan, `GUILD_BAN_ADD`>(
  `GUILD_BAN_ADD`
);
