import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { banSchema, type Ban } from "./types/Ban.ts";

export const getGuildBansSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** of users to return (up to maximum 1000) */
      limit: z.number().int().min(1).max(1000).nullable(),
      /** consider only users before given user id */
      before: z.string().min(1).nullable(),
      /** consider only users after given user id */
      after: z.string().min(1).nullable()
    })
    .partial()
    .optional()
});

/**
 * ### [Get Guild Bans](https://discord.com/developers/docs/resources/guild#get-guild-bans)
 *
 * **GET** `/guilds/:guild/bans`
 *
 * Returns a list of {@link Ban | ban objects} for the users banned from this guild. Requires the `BAN_MEMBERS` permission.
 */
export const getGuildBans: Fetcher<typeof getGuildBansSchema, Ban[]> = async ({
  guild,
  params
}) => get(`/guilds/${guild}/bans`, params);

export const getGuildBansSafe = toValidated(
  getGuildBans,
  getGuildBansSchema,
  banSchema.array()
);

export const getGuildBansProcedure = toProcedure(
  `query`,
  getGuildBans,
  getGuildBansSchema,
  banSchema.array()
);

export const getGuildBansQuery = toQuery(getGuildBans);