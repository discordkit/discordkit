import { z } from "zod";
import { emojiSchema } from "../../emoji";

export const promptOptionSchema = z.object({
  /** ID of the prompt option */
  id: z.string().min(1),
  /** IDs for channels a member is added to when the option is selected */
  channelIds: z.string().min(1).array(),
  /** IDs for roles assigned to a member when the option is selected */
  roleIds: z.string().min(1).array(),
  /** Emoji of the option */
  emoji: emojiSchema,
  /** Title of the option */
  title: z.string().min(1),
  /** Description of the option */
  description: z.string().optional()
});

export type PromptOption = z.infer<typeof promptOptionSchema>;
