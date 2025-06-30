import { object, partial, array, type InferOutput } from "valibot";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { integrationSchema } from "../../guild/types/Integration.js";
import { moderationRuleSchema } from "../../moderation/types/ModerationRule.js";
import { userSchema } from "../../user/types/User.js";
import { webhookSchema } from "../../webhook/types/Webhook.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import { auditLogEntrySchema } from "./AuditLogEntry.js";

export const auditLogSchema = object({
  /** List of application commands referenced in the audit log */
  applicationCommands: array(applicationCommandSchema),
  /** List of audit log entries, sorted from most to least recent */
  auditLogEntries: array(auditLogEntrySchema),
  /** List of auto moderation rules referenced in the audit log */
  autoModerationRules: array(moderationRuleSchema),
  /** List of guild scheduled events referenced in the audit log */
  guildScheduledEvents: array(scheduledEventSchema),
  /** List of partial integration objects */
  integrations: array(partial(integrationSchema)),
  /** List of threads referenced in the audit log */
  threads: array(channelSchema),
  /** List of users referenced in the audit log */
  users: array(userSchema),
  /** List of webhooks referenced in the audit log */
  webhooks: array(webhookSchema)
});

export type AuditLog = InferOutput<typeof auditLogSchema>;
