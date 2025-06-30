import { nonEmpty, object, partial, pipe, string } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const modifyApplicationEmojiSchema = object({
  application: snowflake,
  emoji: snowflake,
  body: partial(
    object({
      /** name of the emoji */
      name: pipe(string(), nonEmpty())
    })
  )
});

/**
 * ### [Modify Application Emoji](https://discord.com/developers/docs/resources/emoji#modify-application-emoji)
 *
 * **PATCH* `/applications/:application/emojis/:emoji`
 *
 * Modify the given emoji. Returns the updated emoji object on success.
 */
export const modifyApplicationEmoji: Fetcher<
  typeof modifyApplicationEmojiSchema,
  Emoji
> = async ({ application, emoji, body }) =>
  patch(`/applications/${application}/emojis/${emoji}`, body);

export const modifyApplicationEmojiSafe = toValidated(
  modifyApplicationEmoji,
  modifyApplicationEmojiSchema,
  emojiSchema
);

export const modifyApplicationEmojiProcedure = toProcedure(
  `mutation`,
  modifyApplicationEmoji,
  modifyApplicationEmojiSchema,
  emojiSchema
);
