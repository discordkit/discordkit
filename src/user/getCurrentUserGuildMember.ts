import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { memberSchema, type Member } from "../guild/types/Member";

const getCurrentUserGuildMemberSchema = z.object({
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

export const getCurrentUserGuildMemberProcedure = createProcedure(
  `query`,
  getCurrentUserGuildMember,
  getCurrentUserGuildMemberSchema,
  memberSchema
);
