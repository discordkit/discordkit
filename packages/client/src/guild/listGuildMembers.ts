import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.ts";

export const listGuildMembersSchema = z.object({
  guild: snowflake,
  params: z
    .object({
      /** max number of members to return (1-1000) */
      limit: z.number().int().min(1).max(1000),
      /** the highest user id in the previous page */
      after: snowflake
    })
    .partial()
    .optional()
});

/**
 * ### [List Guild Members](https://discord.com/developers/docs/resources/guild#list-guild-members)
 *
 * **GET** `/guilds/:guild/members`
 *
 * Returns a list of {@link Member | guild member objects} that are members of the guild.
 *
 * > **WARNING**
 * >
 * > This endpoint is restricted according to whether the `GUILD_MEMBERS` Privileged Intent is enabled for your application.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional
 */
export const listGuildMembers: Fetcher<
  typeof listGuildMembersSchema,
  Member[]
> = async ({ guild, params }) => get(`/guilds/${guild}/members`, params);

export const listGuildMembersSafe = toValidated(
  listGuildMembers,
  listGuildMembersSchema,
  memberSchema.array()
);

export const listGuildMembersProcedure = toProcedure(
  `query`,
  listGuildMembers,
  listGuildMembersSchema,
  memberSchema.array()
);

export const listGuildMembersQuery = toQuery(listGuildMembers);
