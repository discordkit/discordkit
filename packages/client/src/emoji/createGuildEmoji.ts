import * as v from "valibot";
import {
  post,
  type Fetcher,
  snowflake,
  boundedString,
  datauri
} from "@discordkit/core";
import { type Emoji } from "./types/Emoji.js";

export const createGuildEmojiSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** name of the emoji */
    name: boundedString(),
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
 * Create a new emoji for the guild. Requires the `CREATE_GUILD_EXPRESSIONS` permission. Returns the new {@link Emoji | emoji object} on success. Fires a Guild Emojis Update Gateway event.
 *
 * > [!WARNING]
 * >
 * > Emojis and animated emojis have a maximum file size of 256 KiB. Attempting to upload an emoji larger than this limit will fail and return 400 Bad Request and an error message, but not a JSON status code.
 *
 * > [!NOTE]
 * >
 * > We highly recommend that developers use the `.webp` extension when fetching emoji so they're rendered as WebP for maximum performance and compatibility. See the Emoji Formats section above for more details.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildEmoji: Fetcher<
  typeof createGuildEmojiSchema,
  Emoji,
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  post(`/guilds/${guild}/emojis`, body, options);
