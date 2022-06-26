import { z } from "zod";
import type { Member } from "./types";
import { get, query } from "../utils";

export const getGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a guild member object for the specified user.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-member
 */
export const getGuildMember = query(getGuildMemberSchema, ({ guild, user }) =>
  get<Member>(`/guilds/${guild}/members/${user}`)
);
