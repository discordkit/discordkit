import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Guild } from "../guild/types/Guild.js";

export const getCurrentUserGuildsSchema = v.object({
  params: v.exactOptional(
    v.partial(
      v.object({
        /** get guilds before this guild ID */
        before: snowflake,
        /** get guilds after this guild ID */
        after: snowflake,
        /** max number of guilds to return (1-200) */
        limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(200)),
        /** include approximate member and presence counts in response */
        withCounts: v.boolean()
      })
    )
  )
});

/**
 * ### [Get Current User Guilds](https://discord.com/developers/docs/resources/user#get-current-user-guilds)
 *
 * **GET** `/users/@me/guilds`
 *
 * Returns a list of partial {@link Guild | guild objects} the current user is a member of. For OAuth2, requires the `guilds` scope.
 *
 * > [!NOTE]
 * >
 * > This endpoint returns 200 guilds by default, which is the maximum number of guilds a non-bot user can join. Therefore, pagination is **not needed** for integrations that need to get a list of the users' guilds.
 *
 * **Example Partial Guild**
 *
 * ```json
 * {
 *   "id": "80351110224678912",
 *   "name": "1337 Krew",
 *   "icon": "8342729096ea3675442027381ff50dfe",
 *   "banner": "bb42bdc37653b7cf58c4c8cc622e76cb",
 *   "owner": true,
 *   "permissions": "36953089",
 *   "features": ["COMMUNITY", "NEWS", "ANIMATED_ICON", "INVITE_SPLASH", "BANNER", "ROLE_ICONS"],
 *   "approximate_member_count": 3268,
 *   "approximate_presence_count": 784
 * }
 * ```
 */
export const getCurrentUserGuilds: Fetcher<
  typeof getCurrentUserGuildsSchema,
  Array<Partial<Guild>>
> = async ({ params }) => get(`/users/@me/guilds`, params);
