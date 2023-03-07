import type { MessageActivityType } from "./MessageActivityType";

export interface MessageActivity {
  /** type of message activity */
  type: MessageActivityType;
  /** party_id from a Rich Presence event */
  partyId?: string;
}
