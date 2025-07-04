import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildStickerSchema = v.object({
  guild: snowflake,
  sticker: snowflake
});

/**
 * ### [Delete Guild Sticker](https://discord.com/developers/docs/resources/sticker#delete-guild-sticker)
 *
 * **DELETE** `/guilds/:guild/stickers/:sticker`
 *
 * Delete the given sticker. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Stickers Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildSticker: Fetcher<
  typeof deleteGuildStickerSchema
> = async ({ guild, sticker }) =>
  remove(`/guilds/${guild}/stickers/${sticker}`);

export const deleteGuildStickerSafe = toValidated(
  deleteGuildSticker,
  deleteGuildStickerSchema
);

export const deleteGuildStickerProcedure = toProcedure(
  `mutation`,
  deleteGuildSticker,
  deleteGuildStickerSchema
);
