import { maxLength, minLength, object, partial, string } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stickerSchema, type Sticker } from "./types/Sticker.js";

export const modifyGuildStickerSchema = object({
  guild: snowflake,
  sticker: snowflake,
  body: partial(
    object({
      /** name of the sticker (2-30 characters) */
      name: string([minLength(2), maxLength(30)]),
      /** description of the sticker (empty or 2-100 characters) */
      description: string([minLength(2), maxLength(100)]),
      /** autocomplete/suggestion tags for the sticker (max 200 characters) */
      tags: string([minLength(1), maxLength(200)])
    })
  )
});

/**
 * ### [Modify Guild Sticker](https://discord.com/developers/docs/resources/sticker#modify-guild-sticker)
 *
 * **PATCH** `/guilds/:guild/stickers/:sticker`
 *
 * Modify the given sticker. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the updated {@link Sticker | sticker object} on success. Fires a Guild Stickers Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildSticker: Fetcher<
  typeof modifyGuildStickerSchema,
  Sticker
> = async ({ guild, sticker, body }) =>
  patch(`/guilds/${guild}/stickers/${sticker}`, body);

export const modifyGuildStickerSafe = toValidated(
  modifyGuildSticker,
  modifyGuildStickerSchema,
  stickerSchema
);

export const modifyGuildStickerProcedure = toProcedure(
  `query`,
  modifyGuildSticker,
  modifyGuildStickerSchema,
  stickerSchema
);
