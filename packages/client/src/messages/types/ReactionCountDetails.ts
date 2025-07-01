import {
  type GenericSchema,
  type InferOutput,
  integer,
  minValue,
  number,
  object,
  pipe
} from "valibot";

export const reactionCountDetailsSchema = object({
  /** Count of super reactions */
  burst: pipe(number(), integer(), minValue(0)) as GenericSchema<number>,
  /** Count of normal reactions */
  normal: pipe(number(), integer(), minValue(0)) as GenericSchema<number>
});

export interface ReactionCountDetails
  extends InferOutput<typeof reactionCountDetailsSchema> {}
