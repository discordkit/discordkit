import type { Integration } from "@discordkit/client/guild/types/Integration";

/**
 * The payload shared by `INTEGRATION_CREATE` and `INTEGRATION_UPDATE`.
 *
 * The docs specify an integration object "with `user` omitted and an additional
 * `guild_id` key". Both halves matter: keeping `user` would promise a field that
 * never arrives, and omitting `guildId` would hide one that always does — and
 * neither mistake shows up in a typecheck, only against live traffic.
 */
export interface IntegrationEvent extends Omit<Integration, `user`> {
  /** The guild the integration belongs to. */
  guildId: string;
}
