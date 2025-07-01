import * as v from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const createGuildBanSchema = v.object({
  guild: snowflake,
  user: snowflake,
  body: v.exactOptional(
    v.partial(
      v.object({
        /** number of days to delete messages for (0-7) */
        deleteMessageDays: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.maxValue(7)
        ),
        /** number of seconds to delete messages for, between 0 and 604800 (7 days) */
        deleteMessageSeconds: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.maxValue(7)
        )
      })
    )
  )
});

/**
 * ### [Create Guild Ban](https://discord.com/developers/docs/resources/guild#create-guild-ban)
 *
 * **PUT* `/guilds/:guild/bans/:user`
 *
 * Create a guild ban, and optionally delete previous messages sent by the banned user. Requires the `BAN_MEMBERS` permission. Returns a `204 empty` response on success. Fires a Guild Ban Add Gateway event.
 *
 * > [!NOTE]
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
