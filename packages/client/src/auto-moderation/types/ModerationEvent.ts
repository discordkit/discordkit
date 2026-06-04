import * as v from "valibot";

/**
 * ### [Moderation Event](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types)
 */
export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1,
  /** when a member edits their profile */
  MEMBER_UPDATE = 2
}

export const moderationEventSchema = v.enum_(ModerationEvent);
