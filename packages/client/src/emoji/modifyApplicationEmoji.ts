import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  boundedString
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const modifyApplicationEmojiSchema = v.object({
  application: snowflake,
  emoji: snowflake,
  body: v.partial(
    v.object({
      /** name of the emoji */
      name: boundedString()
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
