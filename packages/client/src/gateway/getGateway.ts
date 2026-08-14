import type { Fetcher } from "@discordkit/core";
import { get } from "@discordkit/core/requests/methods";
import type { GatewayResponse } from "./types/GatewayResponse.js";

/**
 * ### [Get Gateway](https://discord.com/developers/docs/events/gateway#get-gateway)
 *
 * **GET** `/gateway`
 *
 * Returns an object with a valid WSS URL which the app can use when [Connecting to the Gateway](https://discord.com/developers/docs/events/gateway#connections). Apps should cache this value and only call this endpoint to retrieve a new URL when they are unable to properly establish a connection using the cached one.
 */
export const getGateway: Fetcher<null, GatewayResponse> = async () =>
  get(`/gateway`);
