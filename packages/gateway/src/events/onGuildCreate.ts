import type { Guild } from "@discordkit/client/guild/types/Guild";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Guild Create](https://discord.com/developers/docs/events/gateway-events#guild-create)
 *
 * Sent in three cases: when a guild listed as unavailable in
 * {@link onReady | Ready} becomes available, when a guild becomes available
 * again after an outage, and when the bot joins a new guild.
 *
 * Gated by the `GUILDS` intent.
 *
 * Because `READY` reports every guild as unavailable, this — not `READY` — is
 * where guild data actually arrives on startup.
 *
 * @example
 * ```ts
 * using sub = onGuildCreate((guild) => {
 *   console.log(`${guild.name} is available`);
 * });
 * ```
 */
export const onGuildCreate = dispatchEvent<Guild, `GUILD_CREATE`>(
  `GUILD_CREATE`
);
