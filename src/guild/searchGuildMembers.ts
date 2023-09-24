import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { memberSchema, type Member } from "./types/Member";

export const searchGuildMembersSchema = z.object({
  guild: z.string().min(1),
  params: z.object({
    /** Query string to match username(s) and nickname(s) against. */
    query: z.string().min(1),
    /** max number of members to return (1-1000) */
    limit: z.number().min(1).max(1000).optional()
  })
});

/**
 * Returns a list of guild member objects whose username or nickname starts with a provided string.
 *
 * https://discord.com/developers/docs/resources/guild#search-guild-members
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
