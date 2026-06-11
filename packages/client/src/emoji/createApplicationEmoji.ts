import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { datauri } from "@discordkit/core/validations/datauri";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Emoji } from "./types/Emoji.js";

export const createApplicationEmojiSchema = v.object({
  application: snowflake,
  body: v.object({
    /** name of the emoji */
    name: boundedString(),
    /** the 128x128 emoji image */
    image: datauri
  })
});

/**
 * ### [Create Application Emoji](https://discord.com/developers/docs/resources/emoji#create-application-emoji)
 *
 * **POST** `/applications/:application/emojis`
 *
 * Create a new emoji for the application. Returns the new emoji object on success.
 *
 * > [!WARNING]
 * >
 * > Emojis and animated emojis have a maximum file size of 256 KiB. Attempting to upload an emoji larger than this limit will fail and return 400 Bad Request and an error message, but not a JSON status code.
 *
 * > [!NOTE]
 * >
 * > We highly recommend that developers use the `.webp` extension when fetching emoji so they're rendered as WebP for maximum performance and compatibility. See the Emoji Formats section above for more details.
 */
export const createApplicationEmoji: Fetcher<
  typeof createApplicationEmojiSchema,
  Emoji
> = async ({ application, body }) =>
  post(`/applications/${application}/emojis`, body);
