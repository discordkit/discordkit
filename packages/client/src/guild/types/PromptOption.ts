import {
  type InferOutput,
  array,
  nonEmpty,
  object,
  nullable,
  string,
  pipe,
  exactOptional,
  boolean
} from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const promptOptionSchema = object({
  /** ID of the prompt option */
  id: snowflake,
  /** IDs for channels a member is added to when the option is selected */
  channelIds: array(snowflake),
  /** IDs for roles assigned to a member when the option is selected */
  roleIds: array(snowflake),
  /** Emoji of the option */
  emoji: exactOptional(emojiSchema),
  /** Emoji ID of the option */
  emojiId: exactOptional(snowflake),
  /** Emoji name of the optio */
  emojiName: exactOptional(pipe(string(), nonEmpty())),
  /** Whether the emoji is animated */
  emojiAnimated: exactOptional(boolean()),
  /** Title of the option */
  title: pipe(string(), nonEmpty()),
  /** Description of the option */
  description: nullable(string())
});

export type PromptOption = InferOutput<typeof promptOptionSchema>;
