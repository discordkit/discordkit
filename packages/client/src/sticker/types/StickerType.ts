import * as v from "valibot";

/**
 * ### [Sticker Type](https://discord.com/developers/docs/resources/sticker#sticker-object)
 *
 * Represents a sticker that can be sent in messages.
 */
export enum StickerType {
  /** an official sticker in a pack, part of Nitro or in a removed purchasable pack */
  STANDARD = 1,
  /** a sticker uploaded to a guild for the guild's members */
  GUILD = 2
}

export const stickerTypeSchema = v.enum_(StickerType);
