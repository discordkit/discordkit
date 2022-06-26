import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Sticker } from "./types";

export const modifyGuildStickerSchema = z.object({
  guild: z.string().min(1),
  sticker: z.string().min(1),
  body: z
    .object({
      /** name of the sticker (2-30 characters) */
      name: z.string().min(2).max(30),
      /** description of the sticker (empty or 2-100 characters) */
      description: z.string().min(2).max(100),
      /** autocomplete/suggestion tags for the sticker (max 200 characters) */
      tags: z.string().min(1).max(200)
    })
    .partial()
});

/**
 * Modify the given sticker. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns the updated sticker object on success.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/sticker#modify-guild-sticker
 */
export const modifyGuildSticker = mutation(modifyGuildStickerSchema, async ({ guild, sticker, body }) =>
  patch<Sticker>(`/guilds/${guild}/stickers/${sticker}`, body)
);
