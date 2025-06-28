import {
  object,
  string,
  minLength,
  nullish,
  type InferOutput,
  pipe
} from "valibot";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: nullish(pipe(string(), minLength(1)))
});

export type MessageActivity = InferOutput<typeof messageActivitySchema>;
