import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { memberSchema, type Member } from "../guild/types/Member";

export const getCurrentUserGuildMemberSchema = z.object({
  guild: z.string()
});

/**
 * Returns a guild member object for the current user. Requires the `guilds.members.read` OAuth2 scope.
 *
 * https://discord.com/developers/docs/resources/user#get-current-user-guild-member
 */
export const getCurrentUserGuildMember: Fetcher<
  typeof getCurrentUserGuildMemberSchema,
  Member
> = async ({ guild }) => get(`/users/@me/guilds/${guild}/member`);

export const getCurrentUserGuildMemberProcedure = toProcedure(
  `query`,
  getCurrentUserGuildMember,
  getCurrentUserGuildMemberSchema,
  memberSchema
);

export const getCurrentUserGuildMemberQuery = toQuery(
  getCurrentUserGuildMember
);
