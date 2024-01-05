import {
  type Output,
  array,
  minLength,
  object,
  optional,
  string
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
  emoji: emojiSchema,
  /** Title of the option */
  title: string([minLength(1)]),
  /** Description of the option */
  description: optional(string())
});

export type PromptOption = Output<typeof promptOptionSchema>;
