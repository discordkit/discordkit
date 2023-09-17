import { z } from "zod";
import type { Member } from "./types";
import { get, query } from "../utils";

export const listGuildMembersSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** max number of members to return (1-1000) */
      limit: z.number().min(1).max(1000),
      /** the highest user id in the previous page */
      after: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * Returns a list of guild member objects that are members of the guild.
 *
 * *This endpoint is restricted according to whether the `GUILD_MEMBERS` [Privileged Intent](https://discord.com/developers/docs/topics/gateway#privileged-intents) is enabled for your application.*
 *
 * https://discord.com/developers/docs/resources/guild#list-guild-members
 */
export const listGuildMembers = query(
  listGuildMembersSchema,
  async ({ input: { guild, params } }) =>
    get<Member[]>(`/guilds/${guild}/members`, params)
);
