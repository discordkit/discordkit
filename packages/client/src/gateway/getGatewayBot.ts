import type { Fetcher } from "@discordkit/core";
import { get } from "@discordkit/core/requests/methods";
import type { GatewayBotResponse } from "./types/GatewayBotResponse.js";

/**
 * ### [Get Gateway Bot](https://discord.com/developers/docs/events/gateway#get-gateway-bot)
 *
 * **GET** `/gateway/bot`
 *
 * Returns an object based on the information in {@link getGateway | Get Gateway}, plus additional metadata that can help during the operation of large or [sharded](https://discord.com/developers/docs/events/gateway#sharding) bots. Unlike the {@link getGateway | Get Gateway}, this route should not be cached for extended periods of time as the value is not guaranteed to be the same per-call, and changes as the bot joins/leaves guilds.
 *
 * > [!WARNING]
 * >
 * > This endpoint requires authentication with a bot token.
 */
export const getGatewayBot: Fetcher<null, GatewayBotResponse> = async () =>
  get(`/gateway/bot`);
