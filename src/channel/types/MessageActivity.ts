import { z } from "zod";
import { messageActivityType } from "./MessageActivityType";

export const messageActivity = z.object({
  /** type of message activity */
  type: messageActivityType,
  /** party_id from a Rich Presence event */
  partyId: z.string().optional()
});

export type MessageActivity = z.infer<typeof messageActivity>;
