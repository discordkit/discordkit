import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Member } from "./types";

export const modifyCurrentMemberSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** value to set user's nickname to (Requires `CHANGE_NICKNAME` permission) */
    nick: z.string().min(1).nullish()
  })
});

/**
 * Modifies the current member in a guild. Returns a `200 OK` with the updated member object on success. Fires a [Guild Member Update](https://discord.com/developers/docs/topics/gateway#guild-member-update) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-current-member
 */
export const modifyCurrentMember = mutation(
  modifyCurrentMemberSchema,
  async ({ guild, body }) => patch<Member>(`/guilds/${guild}/members/@me`, body)
);
