import { z } from "zod";
import { get, query } from "../utils";
import type { Ban } from "./types";

export const getGuildBansSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** of users to return (up to maximum 1000) */
      limit: z.number().min(1).max(1000),
      /** consider only users before given user id */
      before: z.string().min(1),
      /** consider only users after given user id */
      after: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * Returns a list of ban objects for the users banned from this guild. Requires the `BAN_MEMBERS` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-bans
 */
export const getGuildBans = query(
  getGuildBansSchema,
  async ({ input: { guild, params } }) =>
    get<Ban[]>(`/guilds/${guild}/bans`, params)
);
