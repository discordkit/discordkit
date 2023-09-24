import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { banSchema, type Ban } from "./types/Ban";

export const getGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a ban object for the given user or a 404 not found if the ban cannot be found. Requires the `BAN_MEMBERS` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-ban
 */
export const getGuildBan: Fetcher<typeof getGuildBanSchema, Ban> = async ({
  guild,
  user
}) => get(`/guilds/${guild}/bans/${user}`);

export const getGuildBanProcedure = toProcedure(
  `query`,
  getGuildBan,
  getGuildBanSchema,
  banSchema
);

export const getGuildBanQuery = toQuery(getGuildBan);
