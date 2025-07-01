import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  datauri
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const createGuildEmojiSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** name of the emoji */
    name: v.pipe(v.string(), v.nonEmpty()),
    /** the 128x128 emoji image */
    image: datauri,
    /** roles allowed to use this emoji */
    roles: v.array(snowflake)
  })
});

/**
 * ### [Create Guild Emoji](https://discord.com/developers/docs/resources/emoji#create-guild-emoji)
 *
 * **POST** `/guilds/:guild/emojis`
 *
 * Create a new emoji for the guild. Requires the `MANAGE_GUILD_EXPRESSIONS` permission. Returns the new {@link Emoji | emoji object} on success. Fires a Guild Emojis Update Gateway event.
 *
 * > [!WARNING]
 * >
 * > Emojis and animated emojis have a maximum file size of 256kb. Attempting to upload an emoji larger than this limit will fail and return 400 Bad Request and an error message, but not a JSON status code.
 *
 * > [!NOTE]
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
