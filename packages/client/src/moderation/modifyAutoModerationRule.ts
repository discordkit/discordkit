import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ModerationRule,
  moderationRuleSchema
} from "./types/ModerationRule.ts";
import { moderationEventSchema } from "./types/ModerationEvent.ts";
import { triggerMetaSchema } from "./types/TriggerMeta.ts";
import { moderationActionSchema } from "./types/ModerationAction.ts";

export const modifyAutoModerationRuleSchema = z.object({
  guild: snowflake,
  rule: snowflake,
  body: z
    .object({
      /** the rule name */
      name: z.string().min(1),
      /** the event type */
      eventType: moderationEventSchema,
      /** the trigger metadata */
      triggerMetadata: triggerMetaSchema.nullish(),
      /** the actions which will execute when the rule is triggered */
      actions: moderationActionSchema.array(),
      /** whether the rule is enabled (False by default) */
      enabled: z.boolean(),
      /** the role ids that should not be affected by the rule (Maximum of 20) */
      exemptRoles: snowflake.array().max(20),
      /** the channel ids that should not be affected by the rule (Maximum of 50) */
      exemptChannels: snowflake.array().max(50)
    })
    .partial()
});

/**
 * ### [Modify Auto Moderation Rule](https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule)
 * **PATCH** `/guilds/:guild/auto-moderation/rules/:rule`
 *
 * Modify an existing rule. Returns an {@link ModerationRule | auto moderation rule} on success. Fires an Auto Moderation Rule Update Gateway event.
 *
 * > **NOTE**
 * >
 * > Requires `MANAGE_GUILD` permissions.
 *
 * > **NOTE**
 * >
 * > All parameters for this endpoint are optional.
 *
 * > **NOTE**
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
