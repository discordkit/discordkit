import { snowflake } from "@discordkit/core";
import {
  object,
  optional,
  string,
  minLength,
  type InferOutput,
  pipe
} from "valibot";

export const defaultReactionSchema = object({
  /** the id of a guild's custom emoji */
  emojiId: optional(snowflake),
  /** the unicode character of the emoji */
  emojiName: optional(pipe(string(), minLength(1)))
});

export type DefaultReaction = InferOutput<typeof defaultReactionSchema>;
