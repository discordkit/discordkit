// https://discord.com/developers/docs/events/gateway#session-start-limit-object-session-start-limit-structure

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";

const _sessionStartLimitSchema = v.object({
  /** Total number of session starts the current user is allowed */
  total: v.number(),
  /** Remaining number of session starts the current user is allowed */
  remaining: v.number(),
  /** Number of milliseconds after which the limit resets */
  resetAfter: v.number(),
  /** Number of identify requests allowed per 5 seconds */
  maxConcurrency: v.number()
});

export interface SessionStartLimit extends v.InferOutput<
  typeof _sessionStartLimitSchema
> {}

/**
 * ### [Session Start Limit](https://discord.com/developers/docs/events/gateway#session-start-limit-object)
 */
export const sessionStartLimitSchema = schema<SessionStartLimit>(
  _sessionStartLimitSchema
);
