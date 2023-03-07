import type { Channel } from "../../channel";
import type { ScheduledEvent } from "../../event";
import type { Integration } from "../../guild";
import type { ModerationRule } from "../../moderation";
import type { User } from "../../user";
import type { Webhook } from "../../webhook";
import type { AuditLogEntry } from "./AuditLogEntry";

export interface AuditLog {
  /** List of audit log entries, sorted from most to least recent */
  auditLogEntries: AuditLogEntry[];
  /** List of auto moderation rules referenced in the audit log */
  autoModerationRules: ModerationRule[];
  /** List of guild scheduled events referenced in the audit log */
  guildScheduledEvents: ScheduledEvent[];
  /** List of partial integration objects */
  integrations: Partial<Integration>[];
  /** List of threads referenced in the audit log */
  threads: Channel[];
  /** List of users referenced in the audit log */
  users: User[];
  /** List of webhooks referenced in the audit log */
  webhooks: Webhook[];
}
