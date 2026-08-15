import { dispatchEvent } from "../dispatch.js";
import type { IntegrationEvent } from "./types/IntegrationEvent.js";

/**
 * ### [Integration Update](https://discord.com/developers/docs/events/gateway-events#integration-update)
 *
 * Sent when an integration is updated. The payload is an integration object
 * with `user` omitted and an additional `guildId`.
 *
 * Gated by `GUILD_INTEGRATIONS`.
 */
export const onIntegrationUpdate = dispatchEvent<
  IntegrationEvent,
  `INTEGRATION_UPDATE`
>(`INTEGRATION_UPDATE`);
