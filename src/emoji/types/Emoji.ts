import { z } from "zod";
import { userSchema } from "../../user/types/User";

export const emojiSchema = z.object({
  /** emoji id */
  id: z.string().optional(),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: z.string().optional(),
  /** roles allowed to use this emoji */
  roles: z.string().array().optional(),
  /** user that created this emoji */
  user: userSchema.optional(),
  /** whether this emoji must be wrapped in colons */
  requireColons: z.boolean().optional(),
  /** whether this emoji is managed */
  managed: z.boolean().optional(),
  /** whether this emoji is animated */
  animated: z.boolean().optional(),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: z.boolean().optional()
});

export type Emoji = z.infer<typeof emojiSchema>;
