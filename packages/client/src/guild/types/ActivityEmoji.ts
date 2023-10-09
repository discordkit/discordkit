import { snowflake } from "@discordkit/core";
import { object, string, optional, boolean, type Output } from "valibot";

export const activityEmojiSchema = object({
  /** the name of the emoji */
  name: string(),
  /** the id of the emoji */
  id: optional(snowflake),
  /** whether this emoji is animated */
  animated: optional(boolean())
});

export type ActivityEmoji = Output<typeof activityEmojiSchema>;
