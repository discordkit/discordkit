import { type Output, integer, minValue, number, object } from "valibot";

export const reactionCountDetailsSchema = object({
  /** Count of super reactions */
  burst: number([integer(), minValue(0)]),
  /** Count of normal reactions */
  normal: number([integer(), minValue(0)])
});

export type ReactionCountDetails = Output<typeof reactionCountDetailsSchema>;
