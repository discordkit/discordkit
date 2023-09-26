import { z } from "zod";
import { userSchema } from "../../user/types/User";

export const emojiSchema = z.object({
  /** emoji id */
  id: z.string().optional(),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: z.string().optional(),
  /** roles allowed to use this emoji */
  roles: z.string().array().nullable(),
  /** user that created this emoji */
  user: userSchema.nullable(),
  /** whether this emoji must be wrapped in colons */
  requireColons: z.boolean().nullable(),
  /** whether this emoji is managed */
  managed: z.boolean().nullable(),
  /** whether this emoji is animated */
  animated: z.boolean().nullable(),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: z.boolean().nullable()
});

export type Emoji = z.infer<typeof emojiSchema>;
