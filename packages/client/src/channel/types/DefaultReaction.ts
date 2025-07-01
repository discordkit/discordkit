import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const defaultReactionSchema = v.object({
  /** the id of a guild's custom emoji */
  emojiId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the unicode character of the emoji */
  emojiName: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  )
});

export interface DefaultReaction
  extends v.InferOutput<typeof defaultReactionSchema> {}
