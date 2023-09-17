import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1)
});

/**
 * Delete a rule. Returns a `204` on success.
 *
 * *Requires `MANAGE_GUILD` permissions*
 *
 * https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule
 */
export const deleteAutoModerationRule = mutation(
  deleteAutoModerationRuleSchema,
  async ({ guild, rule }) =>
    remove(`/guilds/${guild}/auto-moderation/rules/${rule}`)
);
