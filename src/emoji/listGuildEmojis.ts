import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Emoji } from "./types";

export const listGuildEmojisSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of emoji objects for the given guild.
 *
 * https://discord.com/developers/docs/resources/emoji#list-guild-emojis
 */
export const listGuildEmojis: Fetcher<
  typeof listGuildEmojisSchema,
  Emoji[]
> = async ({ guild }) => get(`/guilds/${guild}/emojis`);
