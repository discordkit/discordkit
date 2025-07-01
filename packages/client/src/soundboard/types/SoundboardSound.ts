import {
  boolean,
  exactOptional,
  maxValue,
  minValue,
  nonEmpty,
  nullable,
  number,
  object,
  pipe,
  string,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const soundboardSoundSchema = object({
  /** the name of this sound */
  name: pipe(string(), nonEmpty()),
  /** the id of this sound */
  soundId: snowflake,
  /** the volume of this sound, from 0 to 1 */
  volume: pipe(number(), minValue(0), maxValue(1)),
  /** the id of this sound's custom emoji */
  emojiId: nullable(snowflake),
  /** the unicode character of this sound's standard emoji */
  emojiName: nullable(pipe(string(), nonEmpty())),
  /** the id of the guild this sound is in */
  guildId: exactOptional(snowflake),
  /** whether this sound can be used, may be false due to loss of Server Boosts */
  available: boolean(),
  /** the user who created this sound */
  user: exactOptional(userSchema)
});

export interface SoundboardSound
  extends InferOutput<typeof soundboardSoundSchema> {}
