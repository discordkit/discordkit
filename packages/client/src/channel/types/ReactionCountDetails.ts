import { z } from "zod";

export const reactionCountDetailsSchema = z.object({
  /** Count of super reactions */
  burst: z.number().int().positive(),
  /** Count of normal reactions */
  normal: z.number().int().positive()
});

export type ReactionCountDetails = z.infer<typeof reactionCountDetailsSchema>;
