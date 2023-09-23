import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { moderationRuleSchema, type ModerationRule } from "./types";

export const getAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1)
});

/**
 * Get a single rule. Returns an auto moderation rule object.
 *
 * *Requires `MANAGE_GUILD` permissions*
 *
 * https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule
 */
export const getAutoModerationRule: Fetcher<
  typeof getAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, rule }) =>
  get(`/guilds/${guild}/auto-moderation/rules/${rule}`);

export const getAutoModerationRuleProcedure = toProcedure(
  `query`,
  getAutoModerationRule,
  getAutoModerationRuleSchema,
  moderationRuleSchema
);

export const getAutoModerationRuleQuery = toQuery(getAutoModerationRule);
