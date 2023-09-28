import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { memberSchema, type Member } from "./types/Member.ts";

export const searchGuildMembersSchema = z.object({
  guild: z.string().min(1),
  params: z.object({
    /** Query string to match username(s) and nickname(s) against. */
    query: z.string().min(1),
    /** max number of members to return (1-1000) */
    limit: z.number().int().min(1).max(1000).optional()
  })
});

/**
 * ### [Search Guild Members](https://discord.com/developers/docs/resources/guild#search-guild-members)
 *
 * **GET** `/guilds/:guild/members/search`
 *
 * Returns a list of {@link Member | guild member objects} whose username or nickname starts with a provided string.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint except for query are optional
 */
export const searchGuildMembers: Fetcher<
  typeof searchGuildMembersSchema,
  Member[]
> = async ({ guild, params }) => get(`/guilds/${guild}/members/search`, params);

export const searchGuildMembersProcedure = toProcedure(
  `query`,
  searchGuildMembers,
  searchGuildMembersSchema,
  memberSchema.array()
);

export const searchGuildMembersQuery = toQuery(searchGuildMembers);
