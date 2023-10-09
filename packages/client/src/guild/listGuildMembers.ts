import {
  array,
  integer,
  maxValue,
  minValue,
  number,
  object,
  optional,
  partial
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.js";

export const listGuildMembersSchema = object({
  guild: snowflake,
  params: optional(
    partial(
      object({
        /** max number of members to return (1-1000) */
        limit: number([integer(), minValue(1), maxValue(1000)]),
        /** the highest user id in the previous page */
        after: snowflake
      })
    )
  )
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
  array(memberSchema)
);

export const listGuildMembersProcedure = toProcedure(
  `query`,
  listGuildMembers,
  listGuildMembersSchema,
  array(memberSchema)
);

export const listGuildMembersQuery = toQuery(listGuildMembers);
