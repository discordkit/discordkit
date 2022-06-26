import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Emoji } from "./types";

export const modifyGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  emoji: z.string().min(1),
  body: z
    .object({
      /** name of the emoji */
      name: z.string().min(1),
      /** roles allowed to use this emoji */
      roles: z.array(z.string().min(1))
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
export const modifyGuildEmoji = mutation(modifyGuildEmojiSchema, async ({ guild, emoji, body }) =>
  patch<Emoji>(`/guilds/${guild}/emojis/${emoji}`, body)
);
