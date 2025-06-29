import { object, exactOptional } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const sendSoundboardSoundSchema = object({
  channel: snowflake,
  body: object({
    /** the id of the soundboard sound to play */
    soundId: snowflake,
    /** the id of the guild the soundboard sound is from, required to play sounds from different servers */
    sourceGuildId: exactOptional(snowflake)
  })
});

/**
 * ### [Send Soundboard Sound](https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound)
 *
 * **POST** `/channels/:channel/send-soundboard-sound`
 *
 * Send a soundboard sound to a voice channel the user is connected to. Fires a Voice Channel Effect Send Gateway event.
 *
 * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the USE_EXTERNAL_SOUNDS permission if the sound is from a different server. Additionally, requires the user to be connected to the voice channel, having a voice state without `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
 */
export const sendSoundboardSound: Fetcher<
  typeof sendSoundboardSoundSchema
> = async ({ channel, body }) =>
  post(`/channels/${channel}/send-soundboard-sound`, body);

export const sendSoundboardSoundSafe = toValidated(
  sendSoundboardSound,
  sendSoundboardSoundSchema
);

export const sendSoundboardSoundProcedure = toProcedure(
  `mutation`,
  sendSoundboardSound,
  sendSoundboardSoundSchema
);
