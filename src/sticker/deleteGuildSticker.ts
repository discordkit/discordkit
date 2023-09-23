import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteGuildStickerSchema = z.object({
  guild: z.string().min(1),
  sticker: z.string().min(1)
});

/**
 * Delete the given sticker. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns `204 No Content` on success.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 */
export const deleteGuildSticker: Fetcher<
  typeof deleteGuildStickerSchema
> = async ({ guild, sticker }) =>
  remove(`/guilds/${guild}/stickers/${sticker}`);

export const deleteGuildStickerProcedure = toProcedure(
  `mutation`,
  deleteGuildSticker,
  deleteGuildStickerSchema
);
