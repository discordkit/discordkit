import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import { emojiSchema, type Emoji } from "./types/Emoji";

export const createGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** name of the emoji */
    name: z.string().min(1),
    /** the 128x128 emoji image */
    image: z.string().min(1),
    /** roles allowed to use this emoji */
    roles: z.string().min(1).array()
  })
});

/**
 * Create a new emoji for the guild. Requires the `MANAGE_EMOJIS_AND_STICKERS` permission. Returns the new emoji object on success. Fires a [Guild Emojis Update](https://discord.com/developers/docs/topics/gateway#guild-emojis-update) Gateway event.
 *
 * *Emojis and animated emojis have a maximum file size of 256kb. Attempting to upload an emoji larger than this limit will fail and return 400 Bad Request and an error message, but not a [JSON status code](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json).*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/emoji#create-guild-emoji
 */
export const createGuildEmoji: Fetcher<
  typeof createGuildEmojiSchema,
  Emoji
> = async ({ guild, body }) => post(`/guilds/${guild}/emojis`, body);

export const createGuildEmojiProcedure = toProcedure(
  `mutation`,
  createGuildEmoji,
  createGuildEmojiSchema,
  emojiSchema
);
