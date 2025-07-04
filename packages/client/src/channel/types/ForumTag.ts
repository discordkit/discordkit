import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";

export const forumTagSchema = v.object({
  /** the id of the tag */
  id: snowflake,
  /** the name of the tag (0-20 characters) */
  name: boundedString({ min: 0, max: 20 }),
  /** whether this tag can only be added to or removed from threads by a member with the `MANAGE_THREADS` permission */
  moderated: v.boolean(),
  /** the id of a guild's custom emoji */
  emojiId: v.nullable(snowflake),
  /** the unicode character of the emoji */
  emojiName: v.nullable(boundedString())
});

export interface ForumTag extends v.InferOutput<typeof forumTagSchema> {}
