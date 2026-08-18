import { dispatchEvent } from "../dispatch.js";
import type { IntegrationEvent } from "./types/IntegrationEvent.js";

/**
 * ### [Integration Create](https://discord.com/developers/docs/events/gateway-events#integration-create)
 *
 * Sent when an integration is created. The payload is an integration object
 * with `user` omitted and an additional `guildId`.
 *
 * Gated by `GUILD_INTEGRATIONS`.
 */
export const onIntegrationCreate = dispatchEvent<
  IntegrationEvent,
  `INTEGRATION_CREATE`
>(`INTEGRATION_CREATE`, [`GUILD_INTEGRATIONS`]);
