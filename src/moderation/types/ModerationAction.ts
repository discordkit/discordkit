import { z } from "zod";
import { moderationActionMetaSchema } from "./ModerationActionMeta.ts";
import { moderationActionTypeSchema } from "./ModerationActionType.ts";

export const moderationActionSchema = z.object({
  /** the type of action */
  type: moderationActionTypeSchema,
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: moderationActionMetaSchema.optional()
});

export type ModerationAction = z.infer<typeof moderationActionSchema>;
