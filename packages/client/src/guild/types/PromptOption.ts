import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const promptOptionSchema = z.object({
  /** ID of the prompt option */
  id: snowflake,
  /** IDs for channels a member is added to when the option is selected */
  channelIds: snowflake.array(),
  /** IDs for roles assigned to a member when the option is selected */
  roleIds: snowflake.array(),
  /** Emoji of the option */
  emoji: emojiSchema,
  /** Title of the option */
  title: z.string().min(1),
  /** Description of the option */
  description: z.string().optional()
});

export type PromptOption = z.infer<typeof promptOptionSchema>;
