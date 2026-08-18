// https://discord.com/developers/docs/events/gateway#get-gateway

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";

const _gatewayResponseSchema = v.object({
  /** WSS URL that can be used for connecting to the Gateway */
  url: v.string()
});

export interface GatewayResponse extends v.InferOutput<
  typeof _gatewayResponseSchema
> {}

/**
 * ### [Get Gateway Response](https://discord.com/developers/docs/events/gateway#get-gateway)
 */
export const gatewayResponseSchema = schema<GatewayResponse>(
  _gatewayResponseSchema
);
