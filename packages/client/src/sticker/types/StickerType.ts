import { z } from "zod";

export enum StickerType {
  /** an official sticker in a pack, part of Nitro or in a removed purchasable pack */
  STANDARD = 1,
  /** a sticker uploaded to a Boosted guild for the guild's members */
  GUILD = 2
}

export const stickerTypeSchema = z.nativeEnum(StickerType);
