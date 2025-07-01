import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const activityEmojiSchema = v.object({
  /** the name of the emoji */
  name: v.string(),
  /** the id of the emoji */
  id: v.optional(snowflake),
  /** whether this emoji is animated */
  animated: v.optional(v.boolean())
});

export interface ActivityEmoji
  extends v.InferOutput<typeof activityEmojiSchema> {}
