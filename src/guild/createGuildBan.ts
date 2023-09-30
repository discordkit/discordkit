import { z } from "zod";
import { put, type Fetcher, toProcedure, toValidated } from "#/utils/index.ts";

export const createGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z
    .object({
      /** number of days to delete messages for (0-7) */
      deleteMessageDays: z.number().int().min(1).max(7).nullable(),
      /** number of seconds to delete messages for, between 0 and 604800 (7 days) */
      deleteMessageSeconds: z.number().int().min(1).max(7).nullable()
    })
    .partial()
    .optional()
});

/**
 * ### [Create Guild Ban](https://discord.com/developers/docs/resources/guild#create-guild-ban)
 *
 * **PUT* `/guilds/:guild/bans/:user`
 *
 * Create a guild ban, and optionally delete previous messages sent by the banned user. Requires the `BAN_MEMBERS` permission. Returns a `204 empty` response on success. Fires a Guild Ban Add Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildBan: Fetcher<typeof createGuildBanSchema> = async ({
  guild,
  user,
  body
}) => put(`/guilds/${guild}/bans/${user}`, body);

export const createGuildBanSafe = toValidated(
  createGuildBan,
  createGuildBanSchema
);

export const createGuildBanProcedure = toProcedure(
  `mutation`,
  createGuildBan,
  createGuildBanSchema
);
