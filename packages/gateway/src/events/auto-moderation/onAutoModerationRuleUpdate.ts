import type { ModerationRule } from "@discordkit/client/auto-moderation/types/ModerationRule";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Auto Moderation Rule Update](https://discord.com/developers/docs/events/gateway-events#auto-moderation-rule-update)
 *
 * Sent when a rule is updated. The inner payload is an auto moderation rule
 * object.
 *
 * Gated by `AUTO_MODERATION_CONFIGURATION`.
 */
export const onAutoModerationRuleUpdate = dispatchEvent<
  ModerationRule,
  `AUTO_MODERATION_RULE_UPDATE`
>(`AUTO_MODERATION_RULE_UPDATE`);
