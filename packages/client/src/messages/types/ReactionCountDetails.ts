import * as v from "valibot";
import { boundedInteger } from "@discordkit/core";

/**
 * ### [Reaction Count Details](https://discord.com/developers/docs/resources/message#reaction-count-details-object)
 *
 * The reaction count details object contains a breakdown of normal and super reaction counts for the associated emoji.
 */
export const reactionCountDetailsSchema = v.object({
  /** Count of super reactions */
  burst: boundedInteger(),
  /** Count of normal reactions */
  normal: boundedInteger()
});

export interface ReactionCountDetails extends v.InferOutput<
  typeof reactionCountDetailsSchema
> {}
