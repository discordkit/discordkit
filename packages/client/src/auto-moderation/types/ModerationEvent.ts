import * as v from "valibot";

export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1,
  /** when a member edits their profile */
  MEMBER_UPDATE = 2
}

export const moderationEventSchema = v.enum_(ModerationEvent);
