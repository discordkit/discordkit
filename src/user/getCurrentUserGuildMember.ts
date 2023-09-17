import { z } from "zod";
import type { Member } from "../guild";
import { query, get } from "../utils";

const getCurrentUserGuildMemberSchema = z.object({
  guild: z.string()
});

/**
 * Returns a guild member object for the current user. Requires the `guilds.members.read` OAuth2 scope.
 *
 * https://discord.com/developers/docs/resources/user#get-current-user-guild-member
 */
export const getCurrentUserGuildMember = query(
  getCurrentUserGuildMemberSchema,
  async ({ input: { guild } }) =>
    get<Member>(`/users/@me/guilds/${guild}/member`)
);
