import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { guildSchema, type Guild } from "../guild/types/Guild.js";

export const getCurrentUserGuildsSchema = z.object({
  params: z
    .object({
      /** get guilds before this guild ID */
      before: snowflake,
      /** get guilds after this guild ID */
      after: snowflake,
      /** max number of guilds to return (1-200) */
      limit: z.number().int().max(200).default(200),
      /** include approximate member and presence counts in response */
      withCounts: z.boolean().default(false)
    })
    .partial()
    .optional()
});

/**
 * ### [Get Current User Guilds](https://discord.com/developers/docs/resources/user#get-current-user-guilds)
 *
 * **GET** `/users/@me/guilds`
 *
 * Returns a list of partial {@link Guild | guild objects} the current user is a member of. Requires the `guilds` OAuth2 scope.
 *
 * #### Example Partial Guild
 *
 * ```json
 *    {
 *      "id": "80351110224678912",
 *      "name": "1337 Krew",
 *      "icon": "8342729096ea3675442027381ff50dfe",
 *      "owner": true,
 *      "permissions": "36953089",
 *      "features": ["COMMUNITY", "NEWS"],
 *      "approximate_member_count": 3268,
 *      "approximate_presence_count": 784
 *    }
 * ```
 *
 * > **NOTE**
 * >
 * > This endpoint returns 200 guilds by default, which is the maximum number of guilds a non-bot user can join. Therefore, pagination is **not needed** for integrations that need to get a list of the users' guilds.
 */
export const getCurrentUserGuilds: Fetcher<
  typeof getCurrentUserGuildsSchema,
  Array<Partial<Guild>>
> = async ({ params }) => get(`/users/@me/guilds`, params);

export const getCurrentUserGuildsSafe = toValidated(
  getCurrentUserGuilds,
  getCurrentUserGuildsSchema,
  guildSchema.partial().array().max(200)
);

export const getCurrentUserGuildsProcedure = toProcedure(
  `query`,
  getCurrentUserGuilds,
  getCurrentUserGuildsSchema,
  guildSchema.partial().array().max(200)
);

export const getCurrentUserGuildsQuery = toQuery(getCurrentUserGuilds);
