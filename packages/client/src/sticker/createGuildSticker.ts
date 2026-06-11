import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { multipart, fileUpload } from "@discordkit/core/validations/fileUpload";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Sticker } from "./types/Sticker.js";

export const createGuildStickerSchema = v.object({
  guild: snowflake,
  body: multipart({
    /** name of the sticker (2-30 characters) */
    name: boundedString({ min: 2, max: 30 }),
    /** description of the sticker (empty or 2-100 characters) */
    description: boundedString({ min: 2, max: 100 }),
    /** autocomplete/suggestion tags for the sticker (max 200 characters) */
    tags: boundedString({ max: 200 }),
    /** the sticker file to upload, must be a PNG, APNG, or Lottie JSON file, max 500 KB */
    file: fileUpload
  })
});

/**
 * ### [Create Guild Sticker](https://discord.com/developers/docs/resources/sticker#create-guild-sticker)
 *
 * **POST** `/guilds/:guild/stickers`
 *
 * Create a new sticker for the guild. Send a `multipart/form-data` body. Requires the `CREATE_GUILD_EXPRESSIONS` permission. Returns the new {@link Sticker | sticker object} on success. Fires a Guild Stickers Update Gateway event.
 *
 * Every guilds has five free sticker slots by default, and each Boost level will grant access to more slots.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > [!WARNING]
 * >
 * > Lottie stickers can only be uploaded on guilds that have either the `VERIFIED` and/or the `PARTNERED` guild feature.
 *
 * > [!WARNING]
 * >
 * > Uploaded stickers are constrained to 5 seconds in length for animated stickers, and 320 x 320 pixels.
 */
export const createGuildSticker: Fetcher<
  typeof createGuildStickerSchema,
  Sticker,
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  post(`/guilds/${guild}/stickers`, body, options);
