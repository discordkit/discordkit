import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const removeGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * ### [Remove Guild Ban](https://discord.com/developers/docs/resources/guild#remove-guild-ban)
 *
 * **DELETE** `/guilds/:guild/bans/:user`
 *
 * Remove the ban for a user. Requires the BAN_MEMBERS permissions. Returns a `204 empty` response on success. Fires a Guild Ban Remove Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildBan: Fetcher<typeof removeGuildBanSchema> = async ({
  guild,
  user
}) => remove(`/guilds/${guild}/bans/${user}`);

export const removeGuildBanProcedure = toProcedure(
  `mutation`,
  removeGuildBan,
  removeGuildBanSchema
);
