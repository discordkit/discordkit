import type { SoundboardSound } from "@discordkit/client/soundboard/types/SoundboardSound";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Guild Soundboard Sound Update](https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-update)
 *
 * Sent when a guild soundboard sound is updated. The inner payload is a
 * soundboard sound object.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildSoundboardSoundUpdate = dispatchEvent<
  SoundboardSound,
  `GUILD_SOUNDBOARD_SOUND_UPDATE`
>(`GUILD_SOUNDBOARD_SOUND_UPDATE`);
