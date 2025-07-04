import * as v from "valibot";
import { timestamp } from "@discordkit/core";
import { messageSchema } from "./Message.js";

export const messagePinSchema = v.object({
  /** the time the message was pinned */
  pinnedAt: timestamp,
  /** the pinned message */
  message: messageSchema
});

export interface MessagePin extends v.InferOutput<typeof messagePinSchema> {}
