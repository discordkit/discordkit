import { nonEmpty, object, pipe, string } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  datauri
} from "@discordkit/core";
import { emojiSchema, type Emoji } from "./types/Emoji.js";

export const createApplicationEmojiSchema = object({
  application: snowflake,
  body: object({
    /** name of the emoji */
    name: pipe(string(), nonEmpty()),
    /** the 128x128 emoji image */
    image: pipe(datauri)
  })
});

/**
 * ### [Create Application Emoji](https://discord.com/developers/docs/resources/emoji#create-application-emoji)
 *
 * **POST** `/applications/:application/emojis`
 *
 * Create a new emoji for the application. Returns the new emoji object on success.
 *
 * > [!WARN]
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

export const createApplicationEmojiSafe = toValidated(
  createApplicationEmoji,
  createApplicationEmojiSchema,
  emojiSchema
);

export const createApplicationEmojiProcedure = toProcedure(
  `mutation`,
  createApplicationEmoji,
  createApplicationEmojiSchema,
  emojiSchema
);
