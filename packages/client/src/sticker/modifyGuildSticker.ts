import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stickerSchema, type Sticker } from "./types/Sticker.js";

export const modifyGuildStickerSchema = v.object({
  guild: snowflake,
  sticker: snowflake,
  body: v.partial(
    v.object({
      /** name of the sticker (2-30 characters) */
      name: v.pipe(v.string(), v.minLength(2), v.maxLength(30)),
      /** description of the sticker (empty or 2-100 characters) */
      description: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
      /** autocomplete/suggestion tags for the sticker (max 200 characters) */
      tags: v.pipe(v.string(), v.minLength(1), v.maxLength(200))
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
  `mutation`,
  modifyGuildSticker,
  modifyGuildStickerSchema,
  stickerSchema
);
