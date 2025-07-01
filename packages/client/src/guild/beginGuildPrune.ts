import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const beginGuildPruneSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** number of days to prune (1-30) */
    days: v.pipe(v.number(), v.minValue(1), v.maxValue(30)),
    /** whether pruned is returned, discouraged for large guilds */
    computePruneCount: v.boolean(),
    /** role(s) to include */
    includeRoles: v.array(snowflake),
    /** @deprecated reason for the prune */
    reason: v.exactOptional(v.pipe(v.string(), v.nonEmpty()))
  })
});

export const guildPruneResultSchema = v.object({
  pruned: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0)))
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
  v.InferOutput<typeof guildPruneResultSchema>
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
