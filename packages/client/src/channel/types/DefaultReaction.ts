import { z } from "zod";

export const defaultReactionSchema = z.object({
  /** the id of a guild's custom emoji */
  emojiId: z.string().min(1).optional(),
  /** the unicode character of the emoji */
  emojiName: z.string().min(1).optional()
});

export type DefaultReaction = z.infer<typeof defaultReactionSchema>;
