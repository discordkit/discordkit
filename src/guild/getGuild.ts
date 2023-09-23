import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildSchema, type Guild } from "./types";

export const getGuildSchema = z.object({
  id: z.string().min(1),
  params: z
    .object({
      /** when true, will return approximate member and presence counts for the guild */
      withCounts: z.boolean()
    })
    .partial()
    .optional()
});

/**
 * Returns the guild object for the given id. If `with_counts` is set to `true`, this endpoint will also return `approximate_member_count` and `approximate_presence_count` for the guild.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild
 */
export const getGuild: Fetcher<typeof getGuildSchema, Guild> = async ({
  id,
  params
}) => get(`/guilds/${id}`, params);

export const getGuildProcedure = toProcedure(
  `query`,
  getGuild,
  getGuildSchema,
  guildSchema
);

export const getGuildQuery = toQuery(getGuild);
