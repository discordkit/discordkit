import { dispatchEvent } from "../dispatch.js";
import type { ModerationActionExecution } from "./types/ModerationActionExecution.js";

/**
 * ### [Auto Moderation Action Execution](https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution)
 *
 * Sent when an auto moderation rule is triggered and its action executed.
 *
 * Gated by `AUTO_MODERATION_EXECUTION`; `content` and `matchedContent` also need the privileged `MESSAGE_CONTENT` intent.
 */
export const onAutoModerationActionExecution = dispatchEvent<
  ModerationActionExecution,
  `AUTO_MODERATION_ACTION_EXECUTION`
>(`AUTO_MODERATION_ACTION_EXECUTION`, [`AUTO_MODERATION_EXECUTION`]);
