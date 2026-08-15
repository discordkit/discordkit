import { dispatchEvent } from "../dispatch.js";
import type { GuildSoundboardSoundDelete } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Soundboard Sound Delete](https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete)
 *
 * Sent when a guild soundboard sound is deleted.
 *
 * Gated by `GUILD_EXPRESSIONS`.
 */
export const onGuildSoundboardSoundDelete = dispatchEvent<
  GuildSoundboardSoundDelete,
  `GUILD_SOUNDBOARD_SOUND_DELETE`
>(`GUILD_SOUNDBOARD_SOUND_DELETE`);
