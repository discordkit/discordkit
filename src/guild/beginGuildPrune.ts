import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";

export const beginGuildPruneSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** number of days to prune (1-30) */
      days: z.number().min(1).max(30),
      /** whether pruned is returned, discouraged for large guilds */
      computePruneCount: z.boolean(),
      /** role(s) to include */
      includeRoles: z.array(z.string().min(1)),
      /** @deprecated reason for the prune */
      reason: z.string().min(1)
    })
    .partial()
});

export const guildPruneResultSchema = z.object({
  pruned: z.number().int().positive().nullable()
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
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const beginGuildPrune: Fetcher<
  typeof beginGuildPruneSchema,
  z.infer<typeof guildPruneResultSchema>
> = async ({ guild, body }) => post(`/guilds/${guild}/prune`, body);

export const beginGuildPruneProcedure = toProcedure(
  `mutation`,
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResultSchema
);
