import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { guildSchema, type Guild } from "../guild/types/Guild";

export const getCurrentUserGuildsSchema = z.object({
  params: z
    .object({
      before: z.string().min(1),
      after: z.string().min(1),
      limit: z.number()
    })
    .partial()
    .optional()
});

/**
 * Returns a list of partial guild objects the current user is a member of. Requires the `guilds` OAuth2 scope.
 *
 * *This endpoint returns 200 guilds by default, which is the maximum number of guilds a non-bot user can join. Therefore, pagination is **not needed** for integrations that need to get a list of the users' guilds.*
 *
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
export const getCurrentUserGuilds: Fetcher<
  typeof getCurrentUserGuildsSchema,
  Guild[]
> = async ({ params }) => get(`/users/@me/guilds`, params);

export const getCurrentUserGuildsProcedure = toProcedure(
  `query`,
  getCurrentUserGuilds,
  getCurrentUserGuildsSchema,
  guildSchema.array()
);

export const getCurrentUserGuildsQuery = toQuery(getCurrentUserGuilds);
