import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const forumTagSchema = z.object({
  /** the id of the tag */
  id: snowflake,
  /** the name of the tag (0-20 characters) */
  name: z.string().min(0).max(20),
  /** whether this tag can only be added to or removed from threads by a member with the `MANAGE_THREADS` permission */
  moderated: z.boolean(),
  /** the id of a guild's custom emoji */
  emojiId: snowflake.optional(),
  /** the unicode character of the emoji */
  emojiName: z.string().min(1).optional()
});

export type ForumTag = z.infer<typeof forumTagSchema>;
