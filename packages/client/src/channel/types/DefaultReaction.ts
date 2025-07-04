import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";

export const defaultReactionSchema = v.object({
  /** the id of a guild's custom emoji */
  emojiId: v.nullable(snowflake),
  /** the unicode character of the emoji */
  emojiName: v.nullable(boundedString())
});

export interface DefaultReaction
  extends v.InferOutput<typeof defaultReactionSchema> {}
