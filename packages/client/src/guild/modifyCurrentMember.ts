import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.js";

export const modifyCurrentMemberSchema = z.object({
  guild: snowflake,
  body: z.object({
    /** value to set user's nickname to (Requires `CHANGE_NICKNAME` permission) */
    nick: z.string().min(1).nullish()
  })
});

/**
 * ### [Modify Current Member](https://discord.com/developers/docs/resources/guild#modify-current-member)
 *
 * **PATCH** `/guilds/:guild/members/@me`
 *
 * Modifies the current member in a guild. Returns a `200` with the updated {@link Member | member object} on success. Fires a Guild Member Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyCurrentMember: Fetcher<
  typeof modifyCurrentMemberSchema,
  Member
> = async ({ guild, body }) => patch(`/guilds/${guild}/members/@me`, body);

export const modifyCurrentMemberSafe = toValidated(
  modifyCurrentMember,
  modifyCurrentMemberSchema,
  memberSchema
);

export const modifyCurrentMemberProcedure = toProcedure(
  `mutation`,
  modifyCurrentMember,
  modifyCurrentMemberSchema,
  memberSchema
);
