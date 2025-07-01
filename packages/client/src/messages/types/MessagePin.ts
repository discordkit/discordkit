import type { InferOutput } from "valibot";
import { isoTimestamp, object, pipe, string } from "valibot";
import { messageSchema } from "./Message.js";

export const messagePinSchema = object({
  /** the time the message was pinned */
  pinnedAt: pipe(string(), isoTimestamp()),
  /** the pinned message */
  message: messageSchema
});

export interface MessagePin extends InferOutput<typeof messagePinSchema> {}
