import * as v from "valibot";
import { messageSchema } from "./Message.js";

export const messagePinSchema = v.object({
  /** the time the message was pinned */
  pinnedAt: v.pipe(v.string(), v.isoTimestamp()),
  /** the pinned message */
  message: messageSchema
});

export interface MessagePin extends v.InferOutput<typeof messagePinSchema> {}
