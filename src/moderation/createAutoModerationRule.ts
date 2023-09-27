import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import {
  type ModerationRule,
  moderationRuleSchema
} from "./types/ModerationRule";
import { moderationEventSchema } from "./types/ModerationEvent";
import { moderationTriggerTypeSchema } from "./types/ModerationTriggerType";
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
    triggerType: moderationTriggerTypeSchema,
    /** the trigger metadata */
    triggerMetadata: triggerMetaSchema.nullable(),
    /** the actions which will execute when the rule is triggered */
    actions: moderationActionSchema.array(),
    /** whether the rule is enabled (False by default) */
    enabled: z.boolean().nullable().default(false),
    /** the role ids that should not be affected by the rule (Maximum of 20) */
    exemptRoles: z.string().min(1).array().max(20).nullable(),
    /** the channel ids that should not be affected by the rule (Maximum of 50) */
    exemptChannels: z.string().min(1).array().max(50).nullable()
  })
});

/**
 * ### [Create Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule)
 *
 * **POST** `/guilds/:guild/auto-moderation/rules`
 *
 * Create a new rule. Returns an {@link ModerationRule | auto moderation rule} on success. Fires an Auto Moderation Rule Create Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
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
