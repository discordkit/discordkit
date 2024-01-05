import {
  object,
  array,
  partial,
  optional,
  number,
  integer,
  nullish,
  minValue,
  maxValue
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { banSchema, type Ban } from "./types/Ban.js";

export const getGuildBansSchema = object({
  guild: snowflake,
  params: optional(
    partial(
      object({
        /** of users to return (up to maximum 1000) */
        limit: nullish(number([integer(), minValue(1), maxValue(1000)])),
        /** consider only users before given user id */
        before: nullish(snowflake),
        /** consider only users after given user id */
        after: nullish(snowflake)
      })
    )
  )
});

/**
 * ### [Get Guild Bans](https://discord.com/developers/docs/resources/guild#get-guild-bans)
 *
 * **GET** `/guilds/:guild/bans`
 *
 * Returns a list of {@link Ban | ban objects} for the users banned from this guild. Requires the `BAN_MEMBERS` permission.
 */
export const getGuildBans: Fetcher<typeof getGuildBansSchema, Ban[]> = async ({
  guild,
  params
}) => get(`/guilds/${guild}/bans`, params);

export const getGuildBansSafe = toValidated(
  getGuildBans,
  getGuildBansSchema,
  array(banSchema)
);

export const getGuildBansProcedure = toProcedure(
  `query`,
  getGuildBans,
  getGuildBansSchema,
  array(banSchema)
);

export const getGuildBansQuery = toQuery(getGuildBans);
