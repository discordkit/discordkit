import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const removeGuildMemberSchema = object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Remove Guild Member](https://discord.com/developers/docs/resources/guild#remove-guild-member)
 *
 * **DELETE** `/guilds/:guild/members/:user`
 *
 * Remove a member from a guild. Requires `KICK_MEMBERS` permission. Returns a `204 empty` response on success. Fires a Guild Member Remove Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildMember: Fetcher<
  typeof removeGuildMemberSchema
> = async ({ guild, user }) => remove(`/guilds/${guild}/members/${user}`);

export const removeGuildMemberSafe = toValidated(
  removeGuildMember,
  removeGuildMemberSchema
);

export const removeGuildMemberProcedure = toProcedure(
  `mutation`,
  removeGuildMember,
  removeGuildMemberSchema
);
