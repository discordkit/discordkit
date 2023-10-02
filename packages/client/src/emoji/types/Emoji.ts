import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.ts";

export const emojiSchema = z.object({
  /** emoji id */
  id: snowflake.optional(),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: z.string().optional(),
  /** roles allowed to use this emoji */
  roles: snowflake.array().nullish(),
  /** user that created this emoji */
  user: userSchema.nullish(),
  /** whether this emoji must be wrapped in colons */
  requireColons: z.boolean().nullish(),
  /** whether this emoji is managed */
  managed: z.boolean().nullish(),
  /** whether this emoji is animated */
  animated: z.boolean().nullish(),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: z.boolean().nullish()
});

export type Emoji = z.infer<typeof emojiSchema>;
