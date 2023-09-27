import { z } from "zod";
import { emojiSchema } from "../../emoji/types/Emoji";
import { reactionCountDetailsSchema } from "./ReactionCountDetails";

export const reactionSchema = z.object({
  /** times this emoji has been used to react */
  count: z.number(),
  /** Reaction count details object */
  countDetails: reactionCountDetailsSchema,
  /** whether the current user reacted using this emoji */
  me: z.boolean(),
  /** Whether the current user super-reacted using this emoji */
  meBurst: z.boolean(),
  /** emoji information */
  emoji: emojiSchema.partial(),
  /** HEX colors used for super reaction */
  burstColors: z.string().array()
});

export type Reaction = z.infer<typeof reactionSchema>;
