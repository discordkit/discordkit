import {
  object,
  number,
  boolean,
  partial,
  string,
  array,
  type InferOutput
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { reactionCountDetailsSchema } from "./ReactionCountDetails.js";

export const reactionSchema = object({
  /** times this emoji has been used to react */
  count: number(),
  /** Reaction count details object */
  countDetails: reactionCountDetailsSchema,
  /** whether the current user reacted using this emoji */
  me: boolean(),
  /** Whether the current user super-reacted using this emoji */
  meBurst: boolean(),
  /** emoji information */
  emoji: partial(emojiSchema),
  /** HEX colors used for super reaction */
  burstColors: array(string())
});

export type Reaction = InferOutput<typeof reactionSchema>;
