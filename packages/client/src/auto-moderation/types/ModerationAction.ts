import { type InferOutput, object, exactOptional } from "valibot";
import { moderationActionMetaSchema } from "./ModerationActionMeta.js";
import { moderationActionTypeSchema } from "./ModerationActionType.js";

export const moderationActionSchema = object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: exactOptional(moderationActionMetaSchema)
});

export type ModerationAction = InferOutput<typeof moderationActionSchema>;
