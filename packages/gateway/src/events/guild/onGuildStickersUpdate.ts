import { dispatchEvent } from "../dispatch.js";
import type { GuildStickersUpdate } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Stickers Update](https://discord.com/developers/docs/events/gateway-events#guild-stickers-update)
 *
 * Sent when a guild's stickers change. The array is the complete new set, not a delta.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildStickersUpdate = dispatchEvent<
  GuildStickersUpdate,
  `GUILD_STICKERS_UPDATE`
>(`GUILD_STICKERS_UPDATE`, [`GUILD_EXPRESSIONS`]);
