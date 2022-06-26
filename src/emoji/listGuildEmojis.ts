import { z } from "zod";
import { get, query } from "../utils";
import type { Emoji } from "./types";

export const listGuildEmojisSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of emoji objects for the given guild.
 *
 * https://discord.com/developers/docs/resources/emoji#list-guild-emojis
 */
export const listGuildEmojis = query(listGuildEmojisSchema, ({ guild }) => get<Emoji[]>(`/guilds/${guild}/emojis`));
