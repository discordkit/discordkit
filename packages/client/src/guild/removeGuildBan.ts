import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const removeGuildBanSchema = object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Remove Guild Ban](https://discord.com/developers/docs/resources/guild#remove-guild-ban)
 *
 * **DELETE** `/guilds/:guild/bans/:user`
 *
 * Remove the ban for a user. Requires the BAN_MEMBERS permissions. Returns a `204 empty` response on success. Fires a Guild Ban Remove Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildBan: Fetcher<typeof removeGuildBanSchema> = async ({
  guild,
  user
}) => remove(`/guilds/${guild}/bans/${user}`);

export const removeGuildBanSafe = toValidated(
  removeGuildBan,
  removeGuildBanSchema
);

export const removeGuildBanProcedure = toProcedure(
  `mutation`,
  removeGuildBan,
  removeGuildBanSchema
);
