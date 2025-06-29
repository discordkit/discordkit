import { array } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import {
  soundboardSoundSchema,
  type SoundboardSound
} from "./types/SoundboardSound.js";

/**
 * ### [List Default Soundboard Sounds](https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds)
 *
 * **GET** `/soundboard-default-sounds`
 *
 * Returns an array of soundboard sound objects that can be used by all users.
 */
export const listDefaultSoundboardSounds: Fetcher<
  null,
  SoundboardSound[]
> = async () => get(`/soundboard-default-sounds`);

export const listDefaultSoundboardSoundsSafe = toValidated(
  listDefaultSoundboardSounds,
  null,
  array(soundboardSoundSchema)
);

export const listDefaultSoundboardSoundsProcedure = toProcedure(
  `query`,
  listDefaultSoundboardSounds,
  null,
  array(soundboardSoundSchema)
);

export const listDefaultSoundboardSoundsQuery = toQuery(
  listDefaultSoundboardSounds
);
