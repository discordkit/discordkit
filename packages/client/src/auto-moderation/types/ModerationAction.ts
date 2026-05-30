import * as v from "valibot";
import { moderationActionMetaSchema } from "./ModerationActionMeta.js";
import { moderationActionTypeSchema } from "./ModerationActionType.js";

/**
 * ### [Moderation Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * An action which will execute whenever a rule is triggered.
 */
export const moderationActionSchema = v.object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: v.exactOptional(moderationActionMetaSchema)
});

export interface ModerationAction extends v.InferOutput<
  typeof moderationActionSchema
> {}
