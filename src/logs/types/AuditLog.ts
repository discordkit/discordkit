import { z } from "zod";
import { channelSchema } from "../../channel/types/Channel";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent";
import { integrationSchema } from "../../guild/types/Integration";
import { moderationRuleSchema } from "../../moderation/types/ModerationRule";
import { userSchema } from "../../user/types/User";
import { webhookSchema } from "../../webhook/types/Webhook";
import { auditLogEntrySchema } from "./AuditLogEntry";

export const auditLogSchema = z.object({
  /** List of audit log entries, sorted from most to least recent */
  auditLogEntries: auditLogEntrySchema.array(),
  /** List of auto moderation rules referenced in the audit log */
  autoModerationRules: moderationRuleSchema.array(),
  /** List of guild scheduled events referenced in the audit log */
  guildScheduledEvents: scheduledEventSchema.array(),
  /** List of partial integration objects */
  integrations: integrationSchema.partial().array(),
  /** List of threads referenced in the audit log */
  threads: channelSchema.array(),
  /** List of users referenced in the audit log */
  users: userSchema.array(),
  /** List of webhooks referenced in the audit log */
  webhooks: webhookSchema.array()
});

export type AuditLog = z.infer<typeof auditLogSchema>;
