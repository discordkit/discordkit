import { z } from "zod";
import { moderationActionMeta } from "./ModerationActionMeta";
import { ModerationActionType } from "./ModerationActionType";

export const moderationAction = z.object({
  /** the type of action */
  type: z.nativeEnum(ModerationActionType),
  /** action metadata	additional metadata needed during execution for this specific action type */
  metadata: moderationActionMeta.optional()
});

export type ModerationAction = z.infer<typeof moderationAction>;
