import { dispatchEvent } from "../dispatch.js";
import type { SoundboardSounds } from "./types/GuildResourceEvents.js";

/**
 * ### [Soundboard Sounds](https://discord.com/developers/docs/events/gateway-events#soundboard-sounds)
 *
 * Sent in response to a Request Soundboard Sounds send-event, carrying a
 * guild's full list of sounds.
 *
 * Never gated by an intent — it answers a request you made, so Discord always
 * delivers it.
 */
export const onSoundboardSounds = dispatchEvent<
  SoundboardSounds,
  `SOUNDBOARD_SOUNDS`
>(`SOUNDBOARD_SOUNDS`);
