import {
  array,
  boolean,
  maxLength,
  minLength,
  nullish,
  object,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ModerationRule,
  moderationRuleSchema
} from "./types/ModerationRule.js";
import { moderationEventSchema } from "./types/ModerationEvent.js";
import { moderationTriggerTypeSchema } from "./types/ModerationTriggerType.js";
import { triggerMetaSchema } from "./types/TriggerMeta.js";
import { moderationActionSchema } from "./types/ModerationAction.js";

export const createAutoModerationRuleSchema = object({
  guild: snowflake,
  body: object({
    /** the rule name */
    name: string([minLength(1)]),
    /** the event type */
    eventType: moderationEventSchema,
    /** the trigger type */
    triggerType: moderationTriggerTypeSchema,
    /** the trigger metadata */
    triggerMetadata: nullish(triggerMetaSchema),
    /** the actions which will execute when the rule is triggered */
    actions: array(moderationActionSchema),
    /** whether the rule is enabled (False by default) */
    enabled: nullish(boolean(), false),
    /** the role ids that should not be affected by the rule (Maximum of 20) */
    exemptRoles: nullish(array(snowflake, [maxLength(20)])),
    /** the channel ids that should not be affected by the rule (Maximum of 50) */
    exemptChannels: nullish(array(snowflake, [maxLength(50)]))
  })
});

/**
 * ### [Create Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule)
 *
 * **POST** `/guilds/:guild/auto-moderation/rules`
 *
 * Create a new rule. Returns an {@link ModerationRule | auto moderation rule} on success. Fires an Auto Moderation Rule Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createAutoModerationRule: Fetcher<
  typeof createAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, body }) =>
  post(`/guilds/${guild}/auto-moderation/rules`, body);

export const createAutoModerationRuleSafe = toValidated(
  createAutoModerationRule,
  createAutoModerationRuleSchema,
  moderationRuleSchema
);

export const createAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  createAutoModerationRule,
  createAutoModerationRuleSchema,
  moderationRuleSchema
);
