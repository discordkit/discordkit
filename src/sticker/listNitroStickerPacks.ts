import type { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { StickerPack } from "./types";

/**
 * Returns the list of sticker packs available to Nitro subscribers.
 *
 * https://discord.com/developers/docs/resources/sticker#list-nitro-sticker-packs
 */
export const listNitroStickerPacks: Fetcher<
  z.ZodUnknown,
  {
    stickerPacks: StickerPack[];
  }
> = async () => get(`/sticker-packs`);
