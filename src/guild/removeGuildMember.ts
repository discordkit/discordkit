import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";

export const removeGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
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
