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

export const getGuildStickerSchema = z.object({
  guild: snowflake,
  sticker: snowflake
});

/**
 * ### [Get Guild Sticker](https://discord.com/developers/docs/resources/sticker#get-guild-sticker)
 *
 * **GET** `/guilds/:guild/stickers/:sticker`
 *
 * Returns a {@link Sticker | sticker object} for the given guild and sticker IDs. Includes the `user` field if the bot has the `MANAGE_GUILD_EXPRESSIONS` permission.
 */
export const getGuildSticker: Fetcher<
  typeof getGuildStickerSchema,
  Sticker
> = async ({ guild, sticker }) => get(`/guilds/${guild}/stickers/${sticker}`);

export const getGuildStickerSafe = toValidated(
  getGuildSticker,
  getGuildStickerSchema,
  stickerSchema
);

export const getGuildStickerProcedure = toProcedure(
  `query`,
  getGuildSticker,
  getGuildStickerSchema,
  stickerSchema
);

export const getGuildStickerQuery = toQuery(getGuildSticker);
