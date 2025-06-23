import { type InferOutput, object, optional } from "valibot";
import { moderationActionMetaSchema } from "./ModerationActionMeta.js";
import { moderationActionTypeSchema } from "./ModerationActionType.js";

export const moderationActionSchema = object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: optional(moderationActionMetaSchema)
});

export type ModerationAction = InferOutput<typeof moderationActionSchema>;
