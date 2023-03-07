import { z } from "zod";
import type { Guild } from "../guild";
import { get, query } from "../utils";

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
export const getCurrentUserGuilds = query(getCurrentUserGuildsSchema, ({ params }) =>
  get<Guild[]>(`/users/@me/guilds`, params)
);
