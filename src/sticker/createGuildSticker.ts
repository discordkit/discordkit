import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import { stickerSchema, type Sticker } from "./types";

export const createGuildStickerSchema = z.object({
  guild: z.string().min(2),
  body: z.object({
    /** name of the sticker (2-30 characters) */
    name: z.string().min(2).max(30),
    /** description of the sticker (empty or 2-100 characters) */
    description: z.string().min(2).max(100),
    /** autocomplete/suggestion tags for the sticker (max 200 characters) */
    tags: z.string().min(1).max(200),
    /** the sticker file to upload, must be a PNG, APNG, or Lottie JSON file, max 500 KB */
    file: z.unknown()
  })
});

/**
 * Create a new sticker for the guild. Send a `multipart/form-data` body. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns the new sticker object on success.
 *
 * Every guilds has five free sticker slots by default, and each Boost level will grant access to more slots.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * *Lottie stickers can only be uploaded on guilds that have either the `VERIFIED` and/or the `PARTNERED` [guild feature](https://discord.com/developers/docs/resources/guild#guild-object-guild-features).*
 *
 * https://discord.com/developers/docs/resources/sticker#create-guild-sticker
 */
export const createGuildSticker: Fetcher<
  typeof createGuildStickerSchema,
  Sticker
> = async ({ guild, body }) => post(`/guilds/${guild}/stickers`, body);

export const createGuildStickerProcedure = toProcedure(
  `mutation`,
  createGuildSticker,
  createGuildStickerSchema,
  stickerSchema
);
