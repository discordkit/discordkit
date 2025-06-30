import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteApplicationEmojiSchema = object({
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

export const deleteApplicationEmojiSafe = toValidated(
  deleteApplicationEmoji,
  deleteApplicationEmojiSchema
);

export const deleteApplicationEmojiProcedure = toProcedure(
  `mutation`,
  deleteApplicationEmoji,
  deleteApplicationEmojiSchema
);
