import type { ModerationRule } from "@discordkit/client/auto-moderation/types/ModerationRule";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Auto Moderation Rule Delete](https://discord.com/developers/docs/events/gateway-events#auto-moderation-rule-delete)
 *
 * Sent when a rule is deleted. The inner payload is an auto moderation rule
 * object.
 *
 * Gated by `AUTO_MODERATION_CONFIGURATION`.
 */
export const onAutoModerationRuleDelete = dispatchEvent<
  ModerationRule,
  `AUTO_MODERATION_RULE_DELETE`
>(`AUTO_MODERATION_RULE_DELETE`);
