import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Emoji } from "./types/Emoji.js";

export const modifyGuildEmojiSchema = v.object({
  guild: snowflake,
  emoji: snowflake,
  body: v.partial(
    v.object({
      /** name of the emoji */
      name: boundedString(),
      /** roles allowed to use this emoji */
      roles: v.nullable(v.array(snowflake))
    })
  )
});

/**
 * ### [Modify Guild Emoji](https://discord.com/developers/docs/resources/emoji#modify-guild-emoji)
 *
 * **PATCH** `/guilds/:guild/emojis/:emoji`
 *
 * Modify the given emoji. For emojis created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission. For other emojis, requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the updated {@link Emoji | emoji object} on success. Fires a Guild Emojis Update Gateway event.
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
  Emoji,
  { auditLogReason: true }
> = async ({ guild, emoji, body }, options) =>
  patch(`/guilds/${guild}/emojis/${emoji}`, body, options);
