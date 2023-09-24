import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { emojiSchema, type Emoji } from "./types/Emoji";

export const modifyGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1),
  body: z
    .object({
      /** name of the emoji */
      name: z.string().min(1),
      /** roles allowed to use this emoji */
      roles: z.string().min(1).array()
    })
    .partial()
});

/**
 * Modify the given emoji. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns the updated emoji object on success. Fires a [Guild Emojis Update Gateway](https://discord.com/developers/docs/topics/gateway#guild-emojis-update) event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/emoji#modify-guild-emoji
 */
export const modifyGuildEmoji: Fetcher<
  typeof modifyGuildEmojiSchema,
  Emoji
> = async ({ guild, emoji, body }) =>
  patch(`/guilds/${guild}/emojis/${emoji}`, body);

export const modifyGuildEmojiProcedure = toProcedure(
  `mutation`,
  modifyGuildEmoji,
  modifyGuildEmojiSchema,
  emojiSchema
);
