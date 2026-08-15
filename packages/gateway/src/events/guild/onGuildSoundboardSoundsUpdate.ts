import { dispatchEvent } from "../dispatch.js";
import type { SoundboardSounds } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Soundboard Sounds Update](https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sounds-update)
 *
 * Sent when several guild soundboard sounds are updated at once.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildSoundboardSoundsUpdate = dispatchEvent<
  SoundboardSounds,
  `GUILD_SOUNDBOARD_SOUNDS_UPDATE`
>(`GUILD_SOUNDBOARD_SOUNDS_UPDATE`, [`GUILD_EXPRESSIONS`]);
