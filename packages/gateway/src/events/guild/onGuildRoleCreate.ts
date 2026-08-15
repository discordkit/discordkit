import { dispatchEvent } from "../dispatch.js";
import type { GuildRole } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Role Create](https://discord.com/developers/docs/events/gateway-events#guild-role-create)
 *
 * Sent when a guild role is created.
 *
 * Gated by `GUILDS`.
 */
export const onGuildRoleCreate = dispatchEvent<GuildRole, `GUILD_ROLE_CREATE`>(
  `GUILD_ROLE_CREATE`
);
