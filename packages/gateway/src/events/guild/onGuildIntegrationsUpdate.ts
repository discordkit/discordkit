import { dispatchEvent } from "../dispatch.js";
import type { GuildIntegrationsUpdate } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Integrations Update](https://discord.com/developers/docs/events/gateway-events#guild-integrations-update)
 *
 * Sent when a guild integration is updated. Carries only the guild id — a signal to re-fetch.
 *
 * Gated by `GUILD_INTEGRATIONS`.
 */
export const onGuildIntegrationsUpdate = dispatchEvent<
  GuildIntegrationsUpdate,
  `GUILD_INTEGRATIONS_UPDATE`
>(`GUILD_INTEGRATIONS_UPDATE`);
