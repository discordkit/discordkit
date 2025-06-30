import {
  array,
  nonEmpty,
  nullable,
  object,
  partial,
  pipe,
  string
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const modifyGuildEmojiSchema = object({
  guild: snowflake,
  emoji: snowflake,
  body: partial(
    object({
      /** name of the emoji */
      name: pipe(string(), nonEmpty()),
      /** roles allowed to use this emoji */
      roles: nullable(array(snowflake))
    })
  )
});

/**
 * ### [Modify Guild Emoji](https://discord.com/developers/docs/resources/emoji#modify-guild-emoji)
 *
 * **PATCH* `/guilds/:guild/emojis/:emoji`
 *
 * Modify the given emoji. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the updated {@link Emoji | emoji object} on success. Fires a Guild Emojis Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildEmoji: Fetcher<
  typeof modifyGuildEmojiSchema,
  Emoji
> = async ({ guild, emoji, body }) =>
  patch(`/guilds/${guild}/emojis/${emoji}`, body);

export const modifyGuildEmojiSafe = toValidated(
  modifyGuildEmoji,
  modifyGuildEmojiSchema,
  emojiSchema
);

export const modifyGuildEmojiProcedure = toProcedure(
  `mutation`,
  modifyGuildEmoji,
  modifyGuildEmojiSchema,
  emojiSchema
);
