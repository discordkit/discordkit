import { object, string, minLength, nullish, type Output } from "valibot";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: nullish(string([minLength(1)]))
});

export type MessageActivity = Output<typeof messageActivitySchema>;
