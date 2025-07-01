import { snowflake } from "@discordkit/core";
import {
  object,
  nullable,
  string,
  nonEmpty,
  type InferOutput,
  pipe,
  type GenericSchema
} from "valibot";

export const defaultReactionSchema = object({
  /** the id of a guild's custom emoji */
  emojiId: nullable<GenericSchema<string>>(snowflake),
  /** the unicode character of the emoji */
  emojiName: nullable<GenericSchema<string>>(pipe(string(), nonEmpty()))
});

export interface DefaultReaction
  extends InferOutput<typeof defaultReactionSchema> {}
