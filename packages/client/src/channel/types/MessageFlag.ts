/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

import { nativeEnum } from "valibot";

export enum MessageFlag {
  /** this message has been published to subscribed channels (via Channel Following) */
  CROSSPOSTED = 1 << 0,
  /** this message originated from a message in another channel (via Channel Following) */
  IS_CROSSPOST = 1 << 1,
  /** do not include any embeds when serializing this message */
  SUPPRESS_EMBEDS = 1 << 2,
  /** the source message for this crosspost has been deleted (via Channel Following) */
  SOURCE_MESSAGE_DELETED = 1 << 3,
  /** this message came from the urgent message system */
  URGENT = 1 << 4,
  /** this message has an associated thread, with the same id as the message */
  HAS_THREAD = 1 << 5,
  /** this message is only visible to the user who invoked the Interaction */
  EPHEMERAL = 1 << 6,
  /** this message is an Interaction Response and the bot is "thinking" */
  LOADING = 1 << 7,
  /** this message failed to mention some roles and add their members to the thread */
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
  /** this message will not trigger push and desktop notifications */
  SUPPRESS_NOTIFICATIONS = 1 << 12,
  /** this message is a voice message */
  IS_VOICE_MESSAGE = 1 << 13
}

export const messageFlagSchema = nativeEnum(MessageFlag);
