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
 */
export const listApplicationEmojis: Fetcher<
  typeof listApplicationEmojisSchema,
  { items: Emoji[] }
> = async ({ application }) => get(`/applications/${application}/emojis`);
