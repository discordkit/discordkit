import * as v from "valibot";
import { snowflake, timestamp } from "@discordkit/core";

/**
 * Information about the call in a private channel.
 */
export const messageCallSchema = v.object({
  /** array of user object ids that participated in the call */
  participants: v.array(snowflake),
  /** time when call ended */
  endedTimestamp: v.nullish(timestamp)
});

export interface MessageCall extends v.InferOutput<typeof messageCallSchema> {}
