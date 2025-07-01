import {
  object,
  string,
  nonEmpty,
  exactOptional,
  type InferOutput,
  pipe
} from "valibot";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: exactOptional(pipe(string(), nonEmpty()))
});

export interface MessageActivity
  extends InferOutput<typeof messageActivitySchema> {}
