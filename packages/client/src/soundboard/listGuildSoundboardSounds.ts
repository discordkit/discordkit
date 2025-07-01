import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  soundboardSoundSchema,
  type SoundboardSound
} from "./types/SoundboardSound.js";

export const listGuildSoundboardSoundsSchema = v.object({
  guild: snowflake
});

/**
 * ### [List Guild Soundboard Sounds](https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds)
 *
 * **GET** `/guilds/:guild/soundboard-sounds`
 *
 * Returns a list of the guild's soundboard sounds. Includes `user` fields if the bot has the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const listGuildSoundboardSounds: Fetcher<
  typeof listGuildSoundboardSoundsSchema,
  SoundboardSound[]
> = async ({ guild }) => get(`/guilds/${guild}/soundboard-sounds`);

export const listGuildSoundboardSoundsSafe = toValidated(
  listGuildSoundboardSounds,
  listGuildSoundboardSoundsSchema,
  v.array(soundboardSoundSchema)
);

export const listGuildSoundboardSoundsProcedure = toProcedure(
  `query`,
  listGuildSoundboardSounds,
  listGuildSoundboardSoundsSchema,
  v.array(soundboardSoundSchema)
);

export const listGuildSoundboardSoundsQuery = toQuery(
  listGuildSoundboardSounds
);
