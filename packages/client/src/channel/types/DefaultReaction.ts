import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

/**
 * ### [Default Reaction](https://discord.com/developers/docs/resources/channel#default-reaction-object)
 *
 * An object that specifies the emoji to use as the default way to react to a forum post. Exactly one of `emojiId` and `emojiName` must be set.
 */
export const defaultReactionSchema = v.object({
  /** the id of a guild's custom emoji */
  emojiId: v.nullable(snowflake),
  /** the unicode character of the emoji */
  emojiName: v.nullable(boundedString())
});

export interface DefaultReaction extends v.InferOutput<
  typeof defaultReactionSchema
> {}
