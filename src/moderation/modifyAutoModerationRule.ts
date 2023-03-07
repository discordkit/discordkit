import { z } from "zod";
import { mutation, patch } from "../utils";
import { moderationAction, triggerMeta, ModerationEvent, type ModerationRule } from "./types";

export const modifyAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1),
  body: z
    .object({
      /** the rule name */
      name: z.string().min(1),
      /** the event type */
      eventType: z.nativeEnum(ModerationEvent),
      /** the trigger metadata */
      triggerMetadata: triggerMeta,
      /** the actions which will execute when the rule is triggered */
      actions: z.array(moderationAction),
      /** whether the rule is enabled (False by default) */
      enabled: z.boolean(),
      /** the role ids that should not be affected by the rule (Maximum of 20) */
      exemptRoles: z.array(z.string().min(1)),
      /** the channel ids that should not be affected by the rule (Maximum of 50) */
      exemptChannels: z.array(z.string().min(1))
    })
    .partial()
});

/**
 * Modify an existing rule. Returns an auto moderation rule on success.
 *
 * *Requires `MANAGE_GUILD` permissions.*
 *
 * https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule
 */
export const modifyAutoModerationRule = mutation(modifyAutoModerationRuleSchema, async ({ guild, rule, body }) =>
  patch<ModerationRule>(`/guilds/${guild}/auto-moderation/rules/${rule}`, body)
);
