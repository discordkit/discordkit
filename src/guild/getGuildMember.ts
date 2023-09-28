import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { memberSchema, type Member } from "./types/Member.ts";

export const getGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * ### [Get Guild Member](https://discord.com/developers/docs/resources/guild#get-guild-member)
 *
 * **GET** `/guilds/:guild/members/:user`
 *
 * Returns a {@link Member | guild member object} for the specified user.
 */
export const getGuildMember: Fetcher<
  typeof getGuildMemberSchema,
  Member
> = async ({ guild, user }) => get(`/guilds/${guild}/members/${user}`);

export const getGuildMemberProcedure = toProcedure(
  `query`,
  getGuildMember,
  getGuildMemberSchema,
  memberSchema
);

export const getGuildMemberQuery = toQuery(getGuildMember);
