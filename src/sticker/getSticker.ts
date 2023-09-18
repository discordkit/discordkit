import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Sticker } from "./types";

export const getStickerSchema = z.object({
  sticker: z.string().min(1)
});

/**
 * Returns a sticker object for the given sticker ID.
 *
 * https://discord.com/developers/docs/resources/sticker#get-sticker
 */
export const getSticker: Fetcher<typeof getStickerSchema, Sticker> = async ({
  sticker
}) => get(`/stickers/${sticker}`);
