import { z } from "zod";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = z.object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: z.string().min(1).nullish()
});

export type MessageActivity = z.infer<typeof messageActivitySchema>;
