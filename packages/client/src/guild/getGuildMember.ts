import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.js";

export const getGuildMemberSchema = v.object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Get Guild Member](https://discord.com/developers/docs/resources/guild#get-guild-member)
 *
 * **GET** `/guilds/:guild/members/:user`
 *
 * Returns a {@link Member | guild member object} for the specified user.
 */
export const getGuildMember: Fetcher<
  typeof getGuildMemberSchema,
  Member
> = async ({ guild, user }) => get(`/guilds/${guild}/members/${user}`);

export const getGuildMemberSafe = toValidated(
  getGuildMember,
  getGuildMemberSchema,
  memberSchema
);

export const getGuildMemberProcedure = toProcedure(
  `query`,
  getGuildMember,
  getGuildMemberSchema,
  memberSchema
);

export const getGuildMemberQuery = toQuery(getGuildMember);
