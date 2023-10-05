import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const defaultReactionSchema = z.object({
  /** the id of a guild's custom emoji */
  emojiId: snowflake.optional(),
  /** the unicode character of the emoji */
  emojiName: z.string().min(1).optional()
});

export type DefaultReaction = z.infer<typeof defaultReactionSchema>;
