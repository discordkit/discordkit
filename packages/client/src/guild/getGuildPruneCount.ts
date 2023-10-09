import {
  type Output,
  object,
  partial,
  optional,
  number,
  integer,
  minValue,
  maxValue,
  string,
  minLength
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";

export const getGuildPruneCountSchema = object({
  guild: snowflake,
  params: optional(
    partial(
      object({
        /** number of days to count prune for (1-30) */
        days: optional(number([integer(), minValue(1), maxValue(30)]), 7),
        /** string; comma-delimited array of snowflakes */
        includeRoles: string([minLength(1)])
      })
    )
  )
});

export const guildPruneCountSchema = object({
  pruned: number([integer(), minValue(0)])
});

/**
 * ### [Get Guild Prune Count](https://discord.com/developers/docs/resources/guild#get-guild-prune-count)
 *
 * **GET** `/guilds/:guild/prune`
 *
 * Returns an object with one `pruned` key indicating the number of members that would be removed in a prune operation. Requires the `KICK_MEMBERS` permission.
 *
 * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the `includeRoles` parameter. Any inactive user that has a subset of the provided role(s) will be counted in the prune and users with additional roles will not.
 */
export const getGuildPruneCount: Fetcher<
  typeof getGuildPruneCountSchema,
  Output<typeof guildPruneCountSchema>
> = async ({ guild, params }) => get(`/guilds/${guild}/prune`, params);

export const getGuildPruneCountSafe = toValidated(
  getGuildPruneCount,
  getGuildPruneCountSchema,
  guildPruneCountSchema
);

export const getGuildPruneCountProcedure = toProcedure(
  `query`,
  getGuildPruneCount,
  getGuildPruneCountSchema,
  guildPruneCountSchema
);

export const getGuildPruneCountQuery = toQuery(getGuildPruneCount);
