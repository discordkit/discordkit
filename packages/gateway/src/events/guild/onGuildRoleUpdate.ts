import { dispatchEvent } from "../dispatch.js";
import type { GuildRole } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Role Update](https://discord.com/developers/docs/events/gateway-events#guild-role-update)
 *
 * Sent when a guild role is updated.
 *
 * Gated by `GUILDS`.
 */
export const onGuildRoleUpdate = dispatchEvent<GuildRole, `GUILD_ROLE_UPDATE`>(
  `GUILD_ROLE_UPDATE`
);
