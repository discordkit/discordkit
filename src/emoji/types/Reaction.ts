import { z } from "zod";
import { emojiSchema } from "./Emoji";

export const reactionSchema = z.object({
  /** times this emoji has been used to react */
  count: z.number(),
  /** whether the current user reacted using this emoji */
  me: z.boolean(),
  /** emoji information */
  emoji: emojiSchema.partial()
});

export type Reaction = z.infer<typeof reactionSchema>;
