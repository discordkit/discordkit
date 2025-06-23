import {
  type InferOutput,
  integer,
  minValue,
  number,
  object,
  pipe
} from "valibot";

export const reactionCountDetailsSchema = object({
  /** Count of super reactions */
  burst: pipe(number(), integer(), minValue(0)),
  /** Count of normal reactions */
  normal: pipe(number(), integer(), minValue(0))
});

export type ReactionCountDetails = InferOutput<
  typeof reactionCountDetailsSchema
>;
