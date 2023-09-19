import { z } from "zod";
import { messageActivityTypeSchema } from "./MessageActivityType";

export const messageActivitySchema = z.object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** party_id from a Rich Presence event */
  partyId: z.string().optional()
});

export type MessageActivity = z.infer<typeof messageActivitySchema>;
