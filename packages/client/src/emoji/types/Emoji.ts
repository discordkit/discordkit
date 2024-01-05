import {
  object,
  optional,
  string,
  nullish,
  array,
  boolean,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const emojiSchema = object({
  /** emoji id */
  id: optional(snowflake),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: optional(string()),
  /** roles allowed to use this emoji */
  roles: nullish(array(snowflake)),
  /** user that created this emoji */
  user: nullish(userSchema),
  /** whether this emoji must be wrapped in colons */
  requireColons: nullish(boolean()),
  /** whether this emoji is managed */
  managed: nullish(boolean()),
  /** whether this emoji is animated */
  animated: nullish(boolean()),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: nullish(boolean())
});

export type Emoji = Output<typeof emojiSchema>;
