import { z } from "zod";
import { get, query } from "../utils";
import type { Sticker } from "./types";

export const listGuildStickersSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns an array of sticker objects for the given guild. Includes `user` fields if the bot has the `MANAGE_EMOJIS_AND_STICKERS` permission.
 *
 * https://discord.com/developers/docs/resources/sticker#list-guild-stickers
 */
export const listGuildStickers = query(listGuildStickersSchema, ({ guild }) =>
  get<Sticker[]>(`/guilds/${guild}/stickers`)
);
