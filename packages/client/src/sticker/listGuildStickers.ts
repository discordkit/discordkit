import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stickerSchema, type Sticker } from "./types/Sticker.ts";

export const listGuildStickersSchema = z.object({
  guild: snowflake
});

/**
 * ### [List Guild Stickers](https://discord.com/developers/docs/resources/sticker#list-guild-stickers)
 *
 * **GET** `/guilds/:guild/stickers`
 *
 * Returns an array of {@link Sticker | sticker objects} for the given guild. Includes `user` fields if the bot has the `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const listGuildStickers: Fetcher<
  typeof listGuildStickersSchema,
  Sticker[]
> = async ({ guild }) => get(`/guilds/${guild}/stickers`);

export const listGuildStickersSafe = toValidated(
  listGuildStickers,
  listGuildStickersSchema,
  stickerSchema.array()
);

export const listGuildStickersProcedure = toProcedure(
  `query`,
  listGuildStickers,
  listGuildStickersSchema,
  stickerSchema.array()
);

export const listGuildStickersQuery = toQuery(listGuildStickers);
