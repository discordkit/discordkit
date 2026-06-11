import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Member } from "./types/Member.js";

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
