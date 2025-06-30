import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const getApplicationEmojiSchema = object({
  application: snowflake,
  emoji: snowflake
});

/**
 * ### [Get Application Emoji](https://discord.com/developers/docs/resources/emoji#get-application-emoji)
 *
 * **GET** `/applications/:application/emojis/:emoji`
 *
 * Returns an {@link Emoji | emoji object} for the given application and emoji IDs. Includes the `user` field.
 */
export const getApplicationEmoji: Fetcher<
  typeof getApplicationEmojiSchema,
  Emoji
> = async ({ application, emoji }) =>
  get(`/applications/${application}/emojis/${emoji}`);

export const getApplicationEmojiSafe = toValidated(
  getApplicationEmoji,
  getApplicationEmojiSchema,
  emojiSchema
);

export const getApplicationEmojiProcedure = toProcedure(
  `query`,
  getApplicationEmoji,
  getApplicationEmojiSchema,
  emojiSchema
);

export const getApplicationEmojiQuery = toQuery(getApplicationEmoji);
