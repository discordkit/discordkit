// https://discord.com/developers/docs/events/gateway#get-gateway-bot-json-response

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import {
  type SessionStartLimit,
  sessionStartLimitSchema
} from "./SessionStartLimit.js";

const _gatewayBotResponseSchema = v.object({
  /** WSS URL that can be used for connecting to the Gateway */
  url: v.string(),
  /** Recommended number of shards to use when connecting */
  shards: v.number(),
  /** Information on the current session start limit */
  sessionStartLimit:
    sessionStartLimitSchema as v.GenericSchema<SessionStartLimit>
});

export interface GatewayBotResponse extends v.InferOutput<
  typeof _gatewayBotResponseSchema
> {}

/**
 * ### [Get Gateway Bot Response](https://discord.com/developers/docs/events/gateway#get-gateway-bot)
 */
export const gatewayBotResponseSchema = schema<GatewayBotResponse>(
  _gatewayBotResponseSchema
);
