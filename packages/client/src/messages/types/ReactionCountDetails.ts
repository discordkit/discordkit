import * as v from "valibot";
import { boundedInteger } from "@discordkit/core";

export const reactionCountDetailsSchema = v.object({
  /** Count of super reactions */
  burst: boundedInteger(),
  /** Count of normal reactions */
  normal: boundedInteger()
});

export interface ReactionCountDetails
  extends v.InferOutput<typeof reactionCountDetailsSchema> {}
