import { enum_ } from "valibot";

export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1
}

export const moderationEventSchema = enum_(ModerationEvent);
