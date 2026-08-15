import type { SoundboardSound } from "@discordkit/client/soundboard/types/SoundboardSound";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Guild Soundboard Sound Create](https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-create)
 *
 * Sent when a guild soundboard sound is created. The inner payload is a
 * soundboard sound object.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildSoundboardSoundCreate = dispatchEvent<
  SoundboardSound,
  `GUILD_SOUNDBOARD_SOUND_CREATE`
>(`GUILD_SOUNDBOARD_SOUND_CREATE`);
