import type { AuditLogEntry } from "@discordkit/client/audit-log/types/AuditLogEntry";
import { dispatchEvent } from "./dispatch.js";

/**
 * The `GUILD_AUDIT_LOG_ENTRY_CREATE` payload: an audit log entry plus its guild.
 *
 * The docs specify "an Audit Log Entry object **with an extra `guild_id` key**",
 * which the base resource doesn't carry — the REST endpoint already knows the
 * guild from the request path, but a dispatch has to name it.
 */
export interface GuildAuditLogEntryCreate extends AuditLogEntry {
  /** The guild the entry was recorded in. */
  guildId: string;
}

/**
 * ### [Guild Audit Log Entry Create](https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create)
 *
 * Sent when a guild audit log entry is created.
 *
 * > [!NOTE]
 * >
 * > Only delivered to bots with the `VIEW_AUDIT_LOG` permission. Without it the
 * > event never arrives — and, as with intents, that failure is silent.
 *
 * Gated by `GUILD_MODERATION`.
 */
export const onGuildAuditLogEntryCreate = dispatchEvent<
  GuildAuditLogEntryCreate,
  `GUILD_AUDIT_LOG_ENTRY_CREATE`
>(`GUILD_AUDIT_LOG_ENTRY_CREATE`);
