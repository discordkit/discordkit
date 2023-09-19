import { z } from "zod";
import { moderationActionMetaSchema } from "./ModerationActionMeta";
import { moderationActionTypeSchema } from "./ModerationActionType";

export const moderationActionSchema = z.object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: moderationActionMetaSchema.optional()
});

export type ModerationAction = z.infer<typeof moderationActionSchema>;
