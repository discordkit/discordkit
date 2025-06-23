import { snowflake } from "@discordkit/core";
import {
  type InferOutput,
  boolean,
  maxLength,
  minLength,
  object,
  optional,
  pipe,
  string
} from "valibot";

export const forumTagSchema = object({
  /** the id of the tag */
  id: snowflake,
  /** the name of the tag (0-20 characters) */
  name: pipe(string(), minLength(0), maxLength(20)),
  /** whether this tag can only be added to or removed from threads by a member with the `MANAGE_THREADS` permission */
  moderated: boolean(),
  /** the id of a guild's custom emoji */
  emojiId: optional(snowflake),
  /** the unicode character of the emoji */
  emojiName: optional(pipe(string(), minLength(1)))
});

export type ForumTag = InferOutput<typeof forumTagSchema>;
