import { get } from "../utils";
import type { StickerPack } from "./types";

/**
 * Returns the list of sticker packs available to Nitro subscribers.
 *
 * https://discord.com/developers/docs/resources/sticker#list-nitro-sticker-packs
 */
export const listNitroStickerPacks = async (): Promise<{
  stickerPacks: StickerPack[];
}> => get(`/sticker-packs`);
