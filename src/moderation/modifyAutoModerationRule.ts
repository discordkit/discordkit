import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import {
  moderationActionSchema,
  triggerMetaSchema,
  moderationEventSchema,
  type ModerationRule,
  moderationRuleSchema
} from "./types";

export const modifyAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  rule: z.string().min(1),
  body: z
    .object({
      /** the rule name */
      name: z.string().min(1),
      /** the event type */
      eventType: moderationEventSchema,
      /** the trigger metadata */
      triggerMetadata: triggerMetaSchema,
      /** the actions which will execute when the rule is triggered */
      actions: moderationActionSchema.array(),
      /** whether the rule is enabled (False by default) */
      enabled: z.boolean(),
      /** the role ids that should not be affected by the rule (Maximum of 20) */
      exemptRoles: z.string().min(1).array(),
      /** the channel ids that should not be affected by the rule (Maximum of 50) */
      exemptChannels: z.string().min(1).array()
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
export const modifyAutoModerationRule: Fetcher<
  typeof modifyAutoModerationRuleSchema,
  ModerationRule
> = async ({ guild, rule, body }) =>
  patch(`/guilds/${guild}/auto-moderation/rules/${rule}`, body);

export const modifyAutoModerationRuleProcedure = toProcedure(
  `mutation`,
  modifyAutoModerationRule,
  modifyAutoModerationRuleSchema,
  moderationRuleSchema
);
