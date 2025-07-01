import * as v from "valibot";
import { moderationActionMetaSchema } from "./ModerationActionMeta.js";
import { moderationActionTypeSchema } from "./ModerationActionType.js";

export const moderationActionSchema = v.object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: v.exactOptional(moderationActionMetaSchema)
});

export interface ModerationAction
  extends v.InferOutput<typeof moderationActionSchema> {}
