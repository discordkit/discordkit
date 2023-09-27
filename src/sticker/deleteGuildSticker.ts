import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteGuildStickerSchema = z.object({
  guild: z.string().min(1),
  sticker: z.string().min(1)
});

/**
 * ### [Delete Guild Sticker](https://discord.com/developers/docs/resources/sticker#delete-guild-sticker)
 *
 * **DELETE** `/guilds/:guild/stickers/:sticker`
 *
 * Delete the given sticker. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Stickers Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
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
