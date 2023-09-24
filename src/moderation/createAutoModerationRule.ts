import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import {
  type ModerationRule,
  moderationRuleSchema
} from "./types/ModerationRule";
import { moderationEventSchema } from "./types/ModerationEvent";
import { moderationTriggerSchema } from "./types/ModerationTrigger";
import { triggerMetaSchema } from "./types/TriggerMeta";
import { moderationActionSchema } from "./types/ModerationAction";

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

export const createAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  createAutoModerationRule,
  createAutoModerationRuleSchema,
  moderationRuleSchema
);
