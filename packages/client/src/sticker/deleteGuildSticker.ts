import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const deleteGuildStickerSchema = v.object({
  guild: snowflake,
  sticker: snowflake
});

/**
 * ### [Delete Guild Sticker](https://discord.com/developers/docs/resources/sticker#delete-guild-sticker)
 *
 * **DELETE** `/guilds/:guild/stickers/:sticker`
 *
 * Delete the given sticker. For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns `204 No Content` on success. Fires a Guild Stickers Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildSticker: Fetcher<
  typeof deleteGuildStickerSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, sticker }, options) =>
  remove(`/guilds/${guild}/stickers/${sticker}`, options);
