import {
  maxLength,
  maxValue,
  minLength,
  minValue,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  string,
  url
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  soundboardSoundSchema,
  type SoundboardSound
} from "./types/SoundboardSound.js";

export const createGuildSoundboardSoundSchema = object({
  guild: snowflake,
  body: object({
    /** name of the soundboard sound (2-32 characters) */
    name: pipe(string(), minLength(2), maxLength(32)),
    /** the mp3 or ogg sound data, base64 encoded, similar to image data */
    sound: pipe(string(), url()),
    /** the volume of the soundboard sound, from 0 to 1, defaults to 1 */
    volumn: nullish(pipe(number(), minValue(0), maxValue(1))),
    /** the id of the custom emoji for the soundboard sound */
    emojiId: nullish(snowflake),
    /** the unicode character of a standard emoji for the soundboard sound */
    emojiName: nullish(pipe(string(), nonEmpty()))
  })
});

/**
 * ### [Create Guild Soundboard Sound](https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound)
 *
 * **POST** `/guilds/:guild/soundboard-sounds`
 *
 * Create a new soundboard sound for the guild. Requires the `CREATE_GUILD_EXPRESSIONS` permission. Returns the new soundboard sound object on success. Fires a Guild Soundboard Sound Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildSoundboardSound: Fetcher<
  typeof createGuildSoundboardSoundSchema,
  SoundboardSound
> = async ({ guild, body }) => post(`/guilds/${guild}/soundboard-sounds`, body);

export const createGuildSoundboardSoundSafe = toValidated(
  createGuildSoundboardSound,
  createGuildSoundboardSoundSchema,
  soundboardSoundSchema
);

export const createGuildSoundboardSoundProcedure = toProcedure(
  `mutation`,
  createGuildSoundboardSound,
  createGuildSoundboardSoundSchema,
  soundboardSoundSchema
);
