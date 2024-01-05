import {
  type Output,
  array,
  boolean,
  integer,
  maxValue,
  minLength,
  minValue,
  nullable,
  number,
  object,
  partial,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const beginGuildPruneSchema = object({
  guild: snowflake,
  body: partial(
    object({
      /** number of days to prune (1-30) */
      days: number([minValue(1), maxValue(30)]),
      /** whether pruned is returned, discouraged for large guilds */
      computePruneCount: boolean(),
      /** role(s) to include */
      includeRoles: array(snowflake),
      /** @deprecated reason for the prune */
      reason: string([minLength(1)])
    })
  )
});

export const guildPruneResultSchema = object({
  pruned: nullable(number([integer(), minValue(0)]))
});

/**
 * ### [Begin Guild Prune](https://discord.com/developers/docs/resources/guild#begin-guild-prune)
 *
 * **POST** `/guilds/:guild/prune`
 *
 * Begin a prune operation. Requires the `KICK_MEMBERS` permission. Returns an object with one `pruned` key indicating the number of members that were removed in the prune operation. For large guilds it's recommended to set the `computePruneCount` option to `false`, forcing `pruned` to `null`. Fires multiple Guild Member Remove Gateway events.
 *
 * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the `includeRoles` parameter. Any inactive user that has a subset of the provided role(s) will be included in the prune and users with additional roles will not.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const beginGuildPrune: Fetcher<
  typeof beginGuildPruneSchema,
  Output<typeof guildPruneResultSchema>
> = async ({ guild, body }) => post(`/guilds/${guild}/prune`, body);

export const beginGuildPruneSafe = toValidated(
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResultSchema
);

export const beginGuildPruneProcedure = toProcedure(
  `mutation`,
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResultSchema
);
