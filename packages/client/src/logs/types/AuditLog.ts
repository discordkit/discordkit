import { z } from "zod";
import { channelSchema } from "../../channel/types/Channel.ts";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.ts";
import { integrationSchema } from "../../guild/types/Integration.ts";
import { moderationRuleSchema } from "../../moderation/types/ModerationRule.ts";
import { userSchema } from "../../user/types/User.ts";
import { webhookSchema } from "../../webhook/types/Webhook.ts";
import { applicationCommandSchema } from "../../application/types/ApplicationCommand.ts";
import { auditLogEntrySchema } from "./AuditLogEntry.ts";

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
