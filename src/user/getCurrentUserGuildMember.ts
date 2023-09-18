import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Member } from "../guild";

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
