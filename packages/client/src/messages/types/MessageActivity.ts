import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

export const messageActivitySchema = v.object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: v.exactOptional(boundedString())
});

export interface MessageActivity
  extends v.InferOutput<typeof messageActivitySchema> {}
