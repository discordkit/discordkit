import { z } from "zod";
import { post, type Fetcher, createProcedure } from "../utils";
import {
  moderationActionSchema,
  triggerMetaSchema,
  moderationEventSchema,
  moderationTriggerSchema,
  type ModerationRule,
  moderationRuleSchema
} from "./types";

export const createAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** the rule name */
    name: z.string().min(1),
    /** the event type */
    eventType: moderationEventSchema,
    /** the trigger type */
    triggerType: moderationTriggerSchema,
    /** the trigger metadata */
    triggerMetadata: triggerMetaSchema.optional(),
    /** the actions which will execute when the rule is triggered */
    actions: moderationActionSchema.array(),
    /** whether the rule is enabled (False by default) */
    enabled: z.boolean().optional(),
    /** the role ids that should not be affected by the rule (Maximum of 20) */
    exemptRoles: z.string().min(1).array().max(20).optional(),
    /** the channel ids that should not be affected by the rule (Maximum of 50) */
    exemptChannels: z.string().min(1).array().max(50).optional()
  })
});

/**
 * Create a new rule. Returns an auto moderation rule on success.
 *
 * *Requires `MANAGE_GUILD` permissions*
 *
 * https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule
 */
export const createAutoModerationRule: Fetcher<
  typeof createAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, body }) =>
  post(`/guilds/${guild}/auto-moderation/rules`, body);

export const createAutoModerationRuleProcedure = createProcedure(
  `mutation`,
  createAutoModerationRule,
  createAutoModerationRuleSchema,
  moderationRuleSchema
);
