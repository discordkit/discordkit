import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  boundedArray,
  boundedString
} from "@discordkit/core";
import {
  type ModerationRule,
  moderationRuleSchema
} from "./types/ModerationRule.js";
import { moderationEventSchema } from "./types/ModerationEvent.js";
import { triggerMetaSchema } from "./types/TriggerMeta.js";
import { moderationActionSchema } from "./types/ModerationAction.js";

export const modifyAutoModerationRuleSchema = v.object({
  guild: snowflake,
  rule: snowflake,
  body: v.partial(
    v.object({
      /** the rule name */
      name: boundedString(),
      /** the event type */
      eventType: moderationEventSchema,
      /** the trigger metadata */
      triggerMetadata: v.exactOptional(triggerMetaSchema),
      /** the actions which will execute when the rule is triggered */
      actions: v.array(moderationActionSchema),
      /** whether the rule is enabled (False by default) */
      enabled: v.boolean(),
      /** the role ids that should not be affected by the rule (Maximum of 20) */
      exemptRoles: boundedArray(snowflake, { max: 20 }),
      /** the channel ids that should not be affected by the rule (Maximum of 50) */
      exemptChannels: boundedArray(snowflake, { max: 50 })
    })
  )
});

/**
 * ### [Modify Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule)
 * **PATCH** `/guilds/:guild/auto-moderation/rules/:rule`
 *
 * Modify an existing rule. Returns an {@link ModerationRule | auto moderation rule} on success. Fires an Auto Moderation Rule Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > Requires `MANAGE_GUILD` permissions.
 *
 * > [!NOTE]
 * >
 * > All parameters for this endpoint are optional.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyAutoModerationRule: Fetcher<
  typeof modifyAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, rule, body }) =>
  patch(`/guilds/${guild}/auto-moderation/rules/${rule}`, body);

export const modifyAutoModerationRuleSafe = toValidated(
  modifyAutoModerationRule,
  modifyAutoModerationRuleSchema,
  moderationRuleSchema
);

export const modifyAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  modifyAutoModerationRule,
  modifyAutoModerationRuleSchema,
  moderationRuleSchema
);
