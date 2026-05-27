import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Emoji } from "./types/Emoji.js";

export const getApplicationEmojiSchema = v.object({
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
