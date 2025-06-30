import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import { array, isoTimestamp, nullish, object, pipe, string } from "valibot";

/**
 * Information about the call in a private channel.
 */
export const messageCallSchema = object({
  /** array of user object ids that participated in the call */
  participants: array(snowflake),
  /** time when call ended */
  endedTimestamp: nullish(pipe(string(), isoTimestamp()))
});

export type MessageCall = InferOutput<typeof messageCallSchema>;
