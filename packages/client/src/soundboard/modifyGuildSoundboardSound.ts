import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  soundboardSoundSchema,
  type SoundboardSound
} from "./types/SoundboardSound.js";

export const modifyGuildSoundboardSoundSchema = v.object({
  guild: snowflake,
  sound: snowflake,
  body: v.partial(
    v.object({
      /** name of the soundboard sound (2-32 characters) */
      name: v.pipe(v.string(), v.minLength(2), v.maxLength(32)),
      /** the volume of the soundboard sound, from 0 to 1, defaults to 1 */
      volumn: v.nullable(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
      /** the id of the custom emoji for the soundboard sound */
      emojiId: v.nullable(snowflake),
      /** the unicode character of a standard emoji for the soundboard sound */
      emojiName: v.nullable(v.pipe(v.string(), v.nonEmpty()))
    })
  )
});

/**
 * ### [Modify Guild Soundboard Sound](https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound)
 *
 * **PATCH** `/guilds/:guild/soundboard-sounds/:sound`
 *
 * Modify the given soundboard sound. For sounds created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission. For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the updated soundboard sound object on success. Fires a Guild Soundboard Sound Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildSoundboardSound: Fetcher<
  typeof modifyGuildSoundboardSoundSchema,
  SoundboardSound
> = async ({ guild, sound, body }) =>
  patch(`/guilds/${guild}/soundboard-sounds/${sound}`, body);

export const modifyGuildSoundboardSoundSafe = toValidated(
  modifyGuildSoundboardSound,
  modifyGuildSoundboardSoundSchema,
  soundboardSoundSchema
);

export const modifyGuildSoundboardSoundProcedure = toProcedure(
  `mutation`,
  modifyGuildSoundboardSound,
  modifyGuildSoundboardSoundSchema,
  soundboardSoundSchema
);
