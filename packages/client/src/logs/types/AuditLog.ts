import { z } from "zod";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { integrationSchema } from "../../guild/types/Integration.js";
import { moderationRuleSchema } from "../../moderation/types/ModerationRule.js";
import { userSchema } from "../../user/types/User.js";
import { webhookSchema } from "../../webhook/types/Webhook.js";
import { applicationCommandSchema } from "../../application/types/ApplicationCommand.js";
import { auditLogEntrySchema } from "./AuditLogEntry.js";

export const auditLogSchema = z.object({
  /** List of application commands referenced in the audit log */
  applicationCommands: applicationCommandSchema.array(),
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
