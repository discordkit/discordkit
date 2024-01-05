import {
  array,
  integer,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  string
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.js";

export const searchGuildMembersSchema = object({
  guild: snowflake,
  params: object({
    /** Query string to match username(s) and nickname(s) against. */
    query: string([minLength(1)]),
    /** max number of members to return (1-1000) */
    limit: optional(number([integer(), minValue(1), maxValue(1000)]))
  })
});

/**
 * ### [Search Guild Members](https://discord.com/developers/docs/resources/guild#search-guild-members)
 *
 * **GET** `/guilds/:guild/members/search`
 *
 * Returns a list of {@link Member | guild member objects} whose username or nickname starts with a provided string.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint except for query are optional
 */
export const searchGuildMembers: Fetcher<
  typeof searchGuildMembersSchema,
  Member[]
> = async ({ guild, params }) => get(`/guilds/${guild}/members/search`, params);

export const searchGuildMembersSafe = toValidated(
  searchGuildMembers,
  searchGuildMembersSchema,
  array(memberSchema)
);

export const searchGuildMembersProcedure = toProcedure(
  `query`,
  searchGuildMembers,
  searchGuildMembersSchema,
  array(memberSchema)
);

export const searchGuildMembersQuery = toQuery(searchGuildMembers);
