// https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { moderationActionSchema } from "@discordkit/client/auto-moderation/types/ModerationAction";
import { moderationTriggerTypeSchema } from "@discordkit/client/auto-moderation/types/ModerationTriggerType";

const _moderationActionExecutionSchema = v.object({
  /** ID of the guild in which the action was executed */
  guildId: snowflake,
  /** Action which was executed */
  action: moderationActionSchema,
  /** ID of the rule which the action belongs to */
  ruleId: snowflake,
  /** Trigger type of the rule which was triggered */
  ruleTriggerType: moderationTriggerTypeSchema,
  /** ID of the user which generated the content which triggered the rule */
  userId: snowflake,
  /** ID of the channel in which user content was posted */
  channelId: v.optional(snowflake),
  /** ID of any user message which content belongs to */
  messageId: v.optional(snowflake),
  /** ID of any system auto moderation messages posted as a result of this action */
  alertSystemMessageId: v.optional(snowflake),
  /** User-generated text content */
  content: v.optional(v.string()),
  /** Word or phrase configured in the rule that triggered the rule */
  matchedKeyword: v.nullable(v.string()),
  /** Substring in content that triggered the rule */
  matchedContent: v.optional(v.nullable(v.string()))
});

export interface ModerationActionExecution extends v.InferOutput<
  typeof _moderationActionExecutionSchema
> {}

/**
 * ### [Auto Moderation Action Execution](https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution)
 *
 * > [!WARNING]
 * >
 * > `content` and `matchedContent` are marked with `***` in the docs: they
 * > require the privileged `MESSAGE_CONTENT` intent. Without it they arrive
 * > empty — the same silent failure as `MESSAGE_CREATE`, which is why they are
 * > optional here rather than required.
 */
export const moderationActionExecutionSchema =
  schema<ModerationActionExecution>(_moderationActionExecutionSchema);
