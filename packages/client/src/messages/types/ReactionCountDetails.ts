import * as v from "valibot";

export const reactionCountDetailsSchema = v.object({
  /** Count of super reactions */
  burst: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** Count of normal reactions */
  normal: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>
});

export interface ReactionCountDetails
  extends v.InferOutput<typeof reactionCountDetailsSchema> {}
