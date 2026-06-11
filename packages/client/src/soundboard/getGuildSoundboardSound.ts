import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { SoundboardSound } from "./types/SoundboardSound.js";

export const getGuildSoundboardSoundSchema = v.object({
  guild: snowflake,
  sound: snowflake
});

/**
 * ### [Get Guild Soundboard Sound](https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound)
 *
 * **GET** `/guilds/:guild/soundboard-sounds/:sound`
 *
 * Returns a soundboard sound object for the given sound id. Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const getGuildSoundboardSound: Fetcher<
  typeof getGuildSoundboardSoundSchema,
  SoundboardSound
> = async ({ guild, sound }) =>
  get(`/guilds/${guild}/soundboard-sounds/${sound}`);
