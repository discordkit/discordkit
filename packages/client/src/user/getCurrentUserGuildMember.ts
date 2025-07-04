import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "../guild/types/Member.js";

export const getCurrentUserGuildMemberSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Current User Guild Member](https://discord.com/developers/docs/resources/user#get-current-user-guild-member)
 *
 * **GET** `/users/@me/guilds/:guild/member`
 *
 * Returns a {@link Member | guild member object} for the current user. Requires the `guilds.members.read` OAuth2 scope.
 */
export const getCurrentUserGuildMember: Fetcher<
  typeof getCurrentUserGuildMemberSchema,
  Member
> = async ({ guild }) => get(`/users/@me/guilds/${guild}/member`);

export const getCurrentUserGuildMemberSafe = toValidated(
  getCurrentUserGuildMember,
  getCurrentUserGuildMemberSchema,
  memberSchema
);

export const getCurrentUserGuildMemberProcedure = toProcedure(
  `query`,
  getCurrentUserGuildMember,
  getCurrentUserGuildMemberSchema,
  memberSchema
);

export const getCurrentUserGuildMemberQuery = toQuery(
  getCurrentUserGuildMember
);
