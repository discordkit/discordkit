import { z } from "zod";
import { mutation, post } from "../utils";
import type { ModerationRule } from "./types";
import { moderationAction, ModerationEvent, ModerationTrigger, triggerMeta } from "./types";

export const createAutoModerationRuleSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** the rule name */
    name: z.string().min(1),
    /** the event type */
    eventType: z.nativeEnum(ModerationEvent),
    /** the trigger type */
    triggerType: z.nativeEnum(ModerationTrigger),
    /** the trigger metadata */
    triggerMetadata: triggerMeta.optional(),
    /** the actions which will execute when the rule is triggered */
    actions: z.array(moderationAction),
    /** whether the rule is enabled (False by default) */
    enabled: z.boolean().optional(),
    /** the role ids that should not be affected by the rule (Maximum of 20) */
    exemptRoles: z.array(z.string().min(1)).max(20).optional(),
    /** the channel ids that should not be affected by the rule (Maximum of 50) */
    exemptChannels: z.array(z.string().min(1)).max(50).optional()
  })
});

/**
 * Create a new rule. Returns an auto moderation rule on success.
 *
 * *Requires `MANAGE_GUILD` permissions*
 *
 * https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule
 */
export const createAutoModerationRule = mutation(createAutoModerationRuleSchema, async ({ guild, body }) =>
  post<ModerationRule>(`/guilds/${guild}/auto-moderation/rules`, body)
);
