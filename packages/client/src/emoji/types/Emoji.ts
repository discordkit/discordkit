import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const emojiSchema = v.object({
  /** emoji id */
  id: v.nullable(snowflake),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: v.nullable(boundedString()),
  /** roles allowed to use this emoji */
  roles: v.exactOptional(v.array(snowflake)),
  /** user that created this emoji */
  user: v.exactOptional(userSchema),
  /** whether this emoji must be wrapped in colons */
  requireColons: v.exactOptional(v.boolean()),
  /** whether this emoji is managed */
  managed: v.exactOptional(v.boolean()),
  /** whether this emoji is animated */
  animated: v.exactOptional(v.boolean()),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: v.exactOptional(v.boolean())
});

export interface Emoji extends v.InferOutput<typeof emojiSchema> {}
