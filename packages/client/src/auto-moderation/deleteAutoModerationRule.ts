import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteAutoModerationRuleSchema = v.object({
  guild: snowflake,
  rule: snowflake
});

/**
 * ### [Delete Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule)
 *
 * **DELETE** `/guilds/:guild/auto-moderation/rules/:rule`
 *
 * Delete a rule. Returns a `204` on success. Fires an Auto Moderation Rule Delete Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteAutoModerationRule: Fetcher<
  typeof deleteAutoModerationRuleSchema
> = async ({ guild, rule }) =>
  remove(`/guilds/${guild}/auto-moderation/rules/${rule}`);

export const deleteAutoModerationRuleSafe = toValidated(
  deleteAutoModerationRule,
  deleteAutoModerationRuleSchema
);

export const deleteAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  deleteAutoModerationRule,
  deleteAutoModerationRuleSchema
);
