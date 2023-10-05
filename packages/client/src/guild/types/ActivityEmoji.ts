import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const activityEmojiSchema = z.object({
  /** the name of the emoji */
  name: z.string(),
  /** the id of the emoji */
  id: snowflake.optional(),
  /** whether this emoji is animated */
  animated: z.boolean().optional()
});

export type ActivityEmoji = z.infer<typeof activityEmojiSchema>;
