import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const forumTagSchema = v.object({
  /** the id of the tag */
  id: snowflake as v.GenericSchema<string>,
  /** the name of the tag (0-20 characters) */
  name: v.pipe(
    v.string(),
    v.minLength(0),
    v.maxLength(20)
  ) as v.GenericSchema<string>,
  /** whether this tag can only be added to or removed from threads by a member with the `MANAGE_THREADS` permission */
  moderated: v.boolean(),
  /** the id of a guild's custom emoji */
  emojiId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** the unicode character of the emoji */
  emojiName: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  )
});

export interface ForumTag extends v.InferOutput<typeof forumTagSchema> {}
