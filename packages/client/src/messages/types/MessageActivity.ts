import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { messageActivityTypeSchema } from "./MessageActivityType.js";

/**
 * ### [Message Activity](https://discord.com/developers/docs/resources/message#message-object-message-activity-types)
 */
export const messageActivitySchema = v.object({
  /** type of message activity */
  type: messageActivityTypeSchema,
  /** partyId from a Rich Presence event */
  partyId: v.exactOptional(boundedString())
});

export interface MessageActivity extends v.InferOutput<
  typeof messageActivitySchema
> {}
