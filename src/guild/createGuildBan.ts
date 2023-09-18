import { z } from "zod";
import { put, type Fetcher } from "../utils";
import type { Ban } from "./types";

export const createGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z
    .object({
      /** number of days to delete messages for (0-7) */
      deleteMessageDays: z.number().min(1).max(7),
      /** @deprecated reason for the ban */
      reason: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * Create a guild ban, and optionally delete previous messages sent by the banned user. Requires the `BAN_MEMBERS` permission. Returns a 204 empty response on success. Fires a [Guild Ban Add](https://discord.com/developers/docs/topics/gateway#guild-ban-add) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#create-guild-ban
 */
export const createGuildBan: Fetcher<
  typeof createGuildBanSchema,
  Ban
> = async ({ guild, user, body }) => put(`/guilds/${guild}/bans/${user}`, body);
