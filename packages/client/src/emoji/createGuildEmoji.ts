import { z } from "zod";
import { post, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.ts";

export const createGuildEmojiSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** name of the emoji */
    name: z.string().min(1),
    /** the 128x128 emoji image */
    image: z.string().url(),
    /** roles allowed to use this emoji */
    roles: z.string().min(1).array()
  })
});

/**
 * ### [Create Guild Emoji](https://discord.com/developers/docs/resources/emoji#create-guild-emoji)
 *
 * **POST** `/guilds/:guild/emojis`
 *
 * Create a new emoji for the guild. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the new {@link Emoji | emoji object} on success. Fires a Guild Emojis Update Gateway event.
 *
 * > **WARNING**
 * >
 * > Emojis and animated emojis have a maximum file size of 256kb. Attempting to upload an emoji larger than this limit will fail and return 400 Bad Request and an error message, but not a JSON status code.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildEmoji: Fetcher<
  typeof createGuildEmojiSchema,
  Emoji
> = async ({ guild, body }) => post(`/guilds/${guild}/emojis`, body);

export const createGuildEmojiSafe = toValidated(
  createGuildEmoji,
  createGuildEmojiSchema,
  emojiSchema
);

export const createGuildEmojiProcedure = toProcedure(
  `mutation`,
  createGuildEmoji,
  createGuildEmojiSchema,
  emojiSchema
);
