import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "#/utils/index.ts";
import { stickerSchema, type Sticker } from "./types/Sticker.ts";

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
 * ### [Modify Guild Sticker](https://discord.com/developers/docs/resources/sticker#modify-guild-sticker)
 *
 * **PATCH** `/guilds/:guild/stickers/:sticker`
 *
 * Modify the given sticker. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the updated {@link Sticker | sticker object} on success. Fires a Guild Stickers Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildSticker: Fetcher<
  typeof modifyGuildStickerSchema,
  Sticker
> = async ({ guild, sticker, body }) =>
  patch(`/guilds/${guild}/stickers/${sticker}`, body);

export const modifyGuildStickerProcedure = toProcedure(
  `query`,
  modifyGuildSticker,
  modifyGuildStickerSchema,
  stickerSchema
);
