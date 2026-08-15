import { dispatchEvent } from "../dispatch.js";
import type { GuildEmojisUpdate } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Emojis Update](https://discord.com/developers/docs/events/gateway-events#guild-emojis-update)
 *
 * Sent when a guild's emojis change. The array is the complete new set, not a delta.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildEmojisUpdate = dispatchEvent<
  GuildEmojisUpdate,
  `GUILD_EMOJIS_UPDATE`
>(`GUILD_EMOJIS_UPDATE`, [`GUILD_EXPRESSIONS`]);
