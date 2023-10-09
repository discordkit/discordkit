import { nativeEnum } from "valibot";

export enum ModerationActionType {
  /** blocks the content of a message according to the rule */
  BLOCK_MESSAGE = 1,
  /** logs user content to a specified channel */
  SEND_ALERT_MESSAGE = 2,
  /**timeout user for a specified duration */
  TIMEOUT = 3
}

export const moderationActionTypeSchema = nativeEnum(ModerationActionType);
