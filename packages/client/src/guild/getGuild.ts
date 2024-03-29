import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { guildSchema, type Guild } from "./types/Guild.js";

export const getGuildSchema = z.object({
  id: snowflake,
  params: z
    .object({
      /** when true, will return approximate member and presence counts for the guild */
      withCounts: z.boolean().default(false)
    })
    .partial()
    .optional()
});

/**
 * ### [Get Guild](https://discord.com/developers/docs/resources/guild#get-guild)
 *
 * **GET** `/guilds/:guild`
 *
 * Returns the {@link Guild | guild object} for the given id. If `withCounts` is set to `true`, this endpoint will also return `approximateMemberCount` and `approximatePresenceCount` for the guild.
 */
export const getGuild: Fetcher<typeof getGuildSchema, Guild> = async ({
  id,
  params
}) => get(`/guilds/${id}`, params);

export const getGuildSafe = toValidated(getGuild, getGuildSchema, guildSchema);

export const getGuildProcedure = toProcedure(
  `query`,
  getGuild,
  getGuildSchema,
  guildSchema
);

export const getGuildQuery = toQuery(getGuild);
