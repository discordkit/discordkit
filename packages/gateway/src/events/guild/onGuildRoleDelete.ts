import { dispatchEvent } from "../dispatch.js";
import type { GuildRoleDelete } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Role Delete](https://discord.com/developers/docs/events/gateway-events#guild-role-delete)
 *
 * Sent when a guild role is deleted. Only the id — the role object is gone.
 *
 * Gated by `GUILDS`.
 */
export const onGuildRoleDelete = dispatchEvent<
  GuildRoleDelete,
  `GUILD_ROLE_DELETE`
>(`GUILD_ROLE_DELETE`);
