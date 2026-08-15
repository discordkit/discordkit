import type { ModerationRule } from "@discordkit/client/auto-moderation/types/ModerationRule";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Auto Moderation Rule Create](https://discord.com/developers/docs/events/gateway-events#auto-moderation-rule-create)
 *
 * Sent when a rule is created. The inner payload is an auto moderation rule
 * object.
 *
 * Gated by `AUTO_MODERATION_CONFIGURATION`.
 */
export const onAutoModerationRuleCreate = dispatchEvent<
  ModerationRule,
  `AUTO_MODERATION_RULE_CREATE`
>(`AUTO_MODERATION_RULE_CREATE`);
