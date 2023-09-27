import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1)
});

/**
 * ### [Delete Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule)
 *
 * **DELETE** `/guilds/:guild/auto-moderation/rules/:rule`
 *
 * Delete a rule. Returns a `204` on success. Fires an Auto Moderation Rule Delete Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteAutoModerationRule: Fetcher<
  typeof deleteAutoModerationRuleSchema
> = async ({ guild, rule }) =>
  remove(`/guilds/${guild}/auto-moderation/rules/${rule}`);

export const deleteAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  deleteAutoModerationRule,
  deleteAutoModerationRuleSchema
);
