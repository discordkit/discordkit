import * as v from "valibot";

/**
 * ### [Moderation Action Type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * An action which will execute whenever a rule is triggered.
 */
export enum ModerationActionType {
  /** blocks a member's message and prevents it from being posted. A custom explanation can be specified and shown to members whenever their message is blocked. */
  BLOCK_MESSAGE = 1,
  /** logs user content to a specified channel */
  SEND_ALERT_MESSAGE = 2,
  /** timeout user for a specified duration */
  TIMEOUT = 3,
  /** prevents a member from using text, voice, or other interactions */
  BLOCK_MEMBER_INTERACTION = 4
}

export const moderationActionTypeSchema = v.enum_(ModerationActionType);
