import { snowflake } from "@discordkit/core";
import { object, optional, string, minLength, type Output } from "valibot";

export const defaultReactionSchema = object({
  /** the id of a guild's custom emoji */
  emojiId: optional(snowflake),
  /** the unicode character of the emoji */
  emojiName: optional(string([minLength(1)]))
});

export type DefaultReaction = Output<typeof defaultReactionSchema>;
