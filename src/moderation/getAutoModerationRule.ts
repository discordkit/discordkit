import { z } from "zod";
import { get, query } from "../utils";
import type { ModerationRule } from "./types";

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
export const getAutoModerationRule = query(getAutoModerationRuleSchema, ({ guild, rule }) =>
  get<ModerationRule>(`/guilds/${guild}/auto-moderation/rules/${rule}`)
);
