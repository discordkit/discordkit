import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";

const _forumTagSchema = v.object({
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

export interface ForumTag extends v.InferOutput<typeof _forumTagSchema> {}

/**
 * ### [Forum Tag](https://discord.com/developers/docs/resources/channel#forum-tag-object)
 *
 * An object that represents a tag that is able to be applied to a thread in a `GUILD_FORUM` or `GUILD_MEDIA` channel.
 */
export const forumTagSchema = schema<ForumTag>(_forumTagSchema);
