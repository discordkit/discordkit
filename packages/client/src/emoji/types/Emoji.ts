import {
  object,
  string,
  array,
  boolean,
  type InferOutput,
  exactOptional,
  nonEmpty,
  nullable,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const emojiSchema = object({
  /** emoji id */
  id: nullable(snowflake),
  /** (can be null only in reaction emoji objects)	emoji name */
  name: nullable(pipe(string(), nonEmpty())),
  /** roles allowed to use this emoji */
  roles: exactOptional(array(snowflake)),
  /** user that created this emoji */
  user: exactOptional(userSchema),
  /** whether this emoji must be wrapped in colons */
  requireColons: exactOptional(boolean()),
  /** whether this emoji is managed */
  managed: exactOptional(boolean()),
  /** whether this emoji is animated */
  animated: exactOptional(boolean()),
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available: exactOptional(boolean())
});

export interface Emoji extends InferOutput<typeof emojiSchema> {}
