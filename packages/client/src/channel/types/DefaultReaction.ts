import { snowflake } from "@discordkit/core";
import {
  object,
  nullable,
  string,
  nonEmpty,
  type InferOutput,
  pipe
} from "valibot";

export const defaultReactionSchema = object({
  /** the id of a guild's custom emoji */
  emojiId: nullable(snowflake),
  /** the unicode character of the emoji */
  emojiName: nullable(pipe(string(), nonEmpty()))
});

export type DefaultReaction = InferOutput<typeof defaultReactionSchema>;
