import { z } from "zod";
import { emoji } from "./Emoji";

export const reaction = z.object({
  /** times this emoji has been used to react */
  count: z.number(),
  /** whether the current user reacted using this emoji */
  me: z.boolean(),
  /** emoji information */
  emoji: emoji.partial()
});

export type Reaction = z.infer<typeof reaction>;
