import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";

export const getGuildPruneCountSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** number of days to count prune for (1-30) */
      days: z.number().min(1).max(30),
      /** role(s) to include */
      includeRoles: z.string().min(1)
    })
    .partial()
    .optional()
});

export const guildPruneCountSchema = z.object({ pruned: z.number() });

/**
 * Returns an object with one `pruned` key indicating the number of members that would be removed in a prune operation. Requires the `KICK_MEMBERS` permission.
 *
 * By default, prune will not remove users with roles. You can optionally include specific roles in your prune by providing the `include_roles` parameter. Any inactive user that has a subset of the provided role(s) will be counted in the prune and users with additional roles will not.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-prune-count
 */
export const getGuildPruneCount: Fetcher<
  typeof getGuildPruneCountSchema,
  z.infer<typeof guildPruneCountSchema>
> = async ({ guild, params }) => get(`/guilds/${guild}/prune`, params);

export const getGuildPruneCountProcedure = toProcedure(
  `query`,
  getGuildPruneCount,
  getGuildPruneCountSchema,
  guildPruneCountSchema
);

export const getGuildPruneCountQuery = toQuery(getGuildPruneCount);
