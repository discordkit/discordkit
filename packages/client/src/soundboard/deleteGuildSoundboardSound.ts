import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildSoundboardSoundSchema = v.object({
  guild: snowflake,
  sound: snowflake
});

/**
 * ### [Delete Guild Soundboard Sound](https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound)
 *
 * **DELETE** `/guilds/:guild/soundboard-sounds/:sound`
 *
 * Delete the given soundboard sound. For sounds created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission. For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Soundboard Sound Delete Gateway event.
 */
export const deleteGuildSoundboardSound: Fetcher<
  typeof deleteGuildSoundboardSoundSchema
> = async ({ guild, sound }) =>
  remove(`/guilds/${guild}/soundboard-sounds/${sound}`);

export const deleteGuildSoundboardSoundSafe = toValidated(
  deleteGuildSoundboardSound,
  deleteGuildSoundboardSoundSchema
);

export const deleteGuildSoundboardSoundProcedure = toProcedure(
  `mutation`,
  deleteGuildSoundboardSound,
  deleteGuildSoundboardSoundSchema
);
