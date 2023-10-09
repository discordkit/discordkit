import { nativeEnum } from "valibot";

export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1
}

export const moderationEventSchema = nativeEnum(ModerationEvent);
