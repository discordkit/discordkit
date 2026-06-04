import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { messageSchema } from "./Message.js";

const _messagePinSchema = v.object({
  /** the time the message was pinned */
  pinnedAt: timestamp,
  /** the pinned message */
  message: messageSchema
});

export interface MessagePin extends v.InferOutput<typeof _messagePinSchema> {}

/**
 * ### [Message Pin](https://discord.com/developers/docs/resources/message#message-pin-object)
 */
export const messagePinSchema = schema<MessagePin>(_messagePinSchema);
