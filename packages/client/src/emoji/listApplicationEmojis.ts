import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Emoji } from "./types/Emoji.js";

export const listApplicationEmojisSchema = v.object({
  application: snowflake
});

/**
 * ### [List Application Emojis](https://discord.com/developers/docs/resources/emoji#list-application-emojis)
 *
 * **GET** `/applications/:application/emojis`
 *
 * Returns an object containing a list of emoji objects for the given application under the `items` key. Includes a `user` object for the team member that uploaded the emoji from the app's settings, or for the bot user if uploaded using the API.
 *
 * ```json
 * {
 *   "items": [
 *     {
 *       "id": "41771983429993937",
 *       "name": "LUL",
 *       "roles": [],
 *       "user": {
 *         "username": "Luigi",
 *         "discriminator": "0002",
 *         "id": "96008815106887111",
 *         "avatar": "5500909a3274e1812beb4e8de6631111",
 *         "public_flags": 131328
 *       },
 *       "require_colons": true,
 *       "managed": false,
 *       "animated": false
 *     }
 *   ]
 * }
 * ```
 */
export const listApplicationEmojis: Fetcher<
  typeof listApplicationEmojisSchema,
  { items: Emoji[] }
> = async ({ application }) => get(`/applications/${application}/emojis`);
