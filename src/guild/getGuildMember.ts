import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Member } from "./types";

export const getGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a guild member object for the specified user.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-member
 */
export const getGuildMember: Fetcher<
  typeof getGuildMemberSchema,
  Member
> = async ({ guild, user }) => get(`/guilds/${guild}/members/${user}`);
