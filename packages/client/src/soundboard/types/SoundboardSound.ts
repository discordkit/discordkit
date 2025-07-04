import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const soundboardSoundSchema = v.object({
  /** the name of this sound */
  name: boundedString(),
  /** the id of this sound */
  soundId: snowflake,
  /** the volume of this sound, from 0 to 1 */
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  /** the id of this sound's custom emoji */
  emojiId: v.nullable(snowflake),
  /** the unicode character of this sound's standard emoji */
  emojiName: v.nullable(boundedString()),
  /** the id of the guild this sound is in */
  guildId: v.exactOptional(snowflake),
  /** whether this sound can be used, may be false due to loss of Server Boosts */
  available: v.boolean(),
  /** the user who created this sound */
  user: v.exactOptional(userSchema)
});

export interface SoundboardSound
  extends v.InferOutput<typeof soundboardSoundSchema> {}
