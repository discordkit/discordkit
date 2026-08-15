import type { Guild } from "@discordkit/client/guild/types/Guild";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Guild Update](https://discord.com/developers/docs/events/gateway-events#guild-update)
 *
 * Sent when a guild is updated. The inner payload is a guild object.
 *
 * Gated by `GUILDS`.
 */
export const onGuildUpdate = dispatchEvent<Guild, `GUILD_UPDATE`>(
  `GUILD_UPDATE`
);
