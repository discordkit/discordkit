import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { memberSchema, type Member } from "./types";

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
export const listGuildMembers: Fetcher<
  typeof listGuildMembersSchema,
  Member[]
> = async ({ guild, params }) => get(`/guilds/${guild}/members`, params);

export const listGuildMembersProcedure = createProcedure(
  `query`,
  listGuildMembers,
  listGuildMembersSchema,
  memberSchema.array()
);
