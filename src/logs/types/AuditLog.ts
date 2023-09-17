import { z } from "zod";
import { channel } from "../../channel";
import { scheduledEvent } from "../../event";
import { integration } from "../../guild";
import { moderationRule } from "../../moderation";
import { user } from "../../user";
import { webhook } from "../../webhook";
import { auditLogEntry } from "./AuditLogEntry";

export const auditLog = z.object({
  /** List of audit log entries, sorted from most to least recent */
  auditLogEntries: auditLogEntry.array(),
  /** List of auto moderation rules referenced in the audit log */
  autoModerationRules: moderationRule.array(),
  /** List of guild scheduled events referenced in the audit log */
  guildScheduledEvents: scheduledEvent.array(),
  /** List of partial integration objects */
  integrations: integration.partial().array(),
  /** List of threads referenced in the audit log */
  threads: channel.array(),
  /** List of users referenced in the audit log */
  users: user.array(),
  /** List of webhooks referenced in the audit log */
  webhooks: webhook.array()
});

export type AuditLog = z.infer<typeof auditLog>;
