import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import {
  moderationRuleSchema,
  type ModerationRule
} from "./types/ModerationRule.ts";

export const getAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1)
});

/**
 * ### [Get Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule)
 *
 * **GET** `/guilds/:guild/auto-moderation/rules/:rule`
 *
 * Get a single rule. Returns an {@link ModerationRule | auto moderation rule object}.
 *
 * > **NOTE**
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 */
export const getAutoModerationRule: Fetcher<
  typeof getAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, rule }) =>
  get(`/guilds/${guild}/auto-moderation/rules/${rule}`);

export const getAutoModerationRuleSafe = toValidated(
  getAutoModerationRule,
  getAutoModerationRuleSchema,
  moderationRuleSchema
);

export const getAutoModerationRuleProcedure = toProcedure(
  `query`,
  getAutoModerationRule,
  getAutoModerationRuleSchema,
  moderationRuleSchema
);

export const getAutoModerationRuleQuery = toQuery(getAutoModerationRule);
