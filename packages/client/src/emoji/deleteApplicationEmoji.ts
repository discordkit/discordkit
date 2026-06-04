import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteApplicationEmojiSchema = v.object({
  application: snowflake,
  emoji: snowflake
});

/**
 * ### [Delete Application Emoji](https://discord.com/developers/docs/resources/emoji#delete-application-emoji)
 *
 * **DELETE** `/applications/:application/emojis/:emoji`
 *
 * Delete the given emoji. Returns `204 No Content` on success.
 */
export const deleteApplicationEmoji: Fetcher<
  typeof deleteApplicationEmojiSchema
> = async ({ application, emoji }) =>
  remove(`/applications/${application}/emojis/${emoji}`);
