import { z } from "zod";

export enum ModerationEvent {
  /** when a member sends or edits a message in the guild */
  MESSAGE_SEND = 1
}

export const moderationEventSchema = z.nativeEnum(ModerationEvent);
