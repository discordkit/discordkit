import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Sticker } from "./types/Sticker.js";

export const getStickerSchema = v.object({
  sticker: snowflake
});

/**
 * ### [Get Sticker](https://discord.com/developers/docs/resources/sticker#get-sticker)
 *
 * **GET** `/stickers/:sticker`
 *
 * Returns a {@link Sticker | sticker object} for the given sticker ID.
 */
export const getSticker: Fetcher<typeof getStickerSchema, Sticker> = async ({
  sticker
}) => get(`/stickers/${sticker}`);
