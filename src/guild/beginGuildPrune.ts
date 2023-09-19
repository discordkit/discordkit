import { z } from "zod";
import { post, type Fetcher, createProcedure } from "../utils";

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

export const guildPruneResult = z.object({ pruned: z.number().nullable() });

/**
 * Begin a prune operation. Requires the `KICK_MEMBERS` permission. Returns an object with one `pruned` key indicating the number of members that were removed in the prune operation. For large guilds it's recommended to set the `compute_prune_count` option to `false`, forcing `pruned` to `null`. Fires multiple [Guild Member Remove](https://discord.com/developers/docs/topics/gateway#guild-member-remove) Gateway events.
 *
 * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the `include_roles` parameter. Any inactive user that has a subset of the provided role(s) will be included in the prune and users with additional roles will not.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#begin-guild-prune
 */
export const beginGuildPrune: Fetcher<
  typeof beginGuildPruneSchema,
  z.infer<typeof guildPruneResult>
> = async ({ guild, body }) => post(`/guilds/${guild}/prune`, body);

export const beginGuildPruneProcedure = createProcedure(
  `mutation`,
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResult
);
