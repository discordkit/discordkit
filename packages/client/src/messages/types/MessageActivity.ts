import * as v from "valibot";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = v.object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: v.exactOptional(v.pipe(v.string(), v.nonEmpty()))
});

export interface MessageActivity
  extends v.InferOutput<typeof messageActivitySchema> {}
