import * as v from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { reactionCountDetailsSchema } from "./ReactionCountDetails.js";

export const reactionSchema = v.object({
  /** times this emoji has been used to react */
  count: v.number(),
  /** Reaction count details object */
  countDetails: reactionCountDetailsSchema,
  /** whether the current user reacted using this emoji */
  me: v.boolean(),
  /** Whether the current user super-reacted using this emoji */
  meBurst: v.boolean(),
  /** emoji information */
  emoji: v.partial(emojiSchema),
  /** HEX colors used for super reaction */
  burstColors: v.array(v.string())
});

export interface Reaction extends v.InferOutput<typeof reactionSchema> {}
