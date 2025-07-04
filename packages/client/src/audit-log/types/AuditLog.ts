import * as v from "valibot";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { integrationSchema } from "../../guild/types/Integration.js";
import { moderationRuleSchema } from "../../auto-moderation/types/ModerationRule.js";
import { userSchema } from "../../user/types/User.js";
import { webhookSchema } from "../../webhook/types/Webhook.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import { auditLogEntrySchema } from "./AuditLogEntry.js";

export const auditLogSchema = v.object({
  /** List of application commands referenced in the audit log */
  applicationCommands: v.array(applicationCommandSchema),
  /** List of audit log entries, sorted from most to least recent */
  auditLogEntries: v.array(auditLogEntrySchema),
  /** List of auto moderation rules referenced in the audit log */
  autoModerationRules: v.array(moderationRuleSchema),
  /** List of guild scheduled events referenced in the audit log */
  guildScheduledEvents: v.array(scheduledEventSchema),
  /** List of partial integration objects */
  integrations: v.array(v.partial(integrationSchema)),
  /** List of threads referenced in the audit log */
  threads: v.array(channelSchema),
  /** List of users referenced in the audit log */
  users: v.array(userSchema),
  /** List of webhooks referenced in the audit log */
  webhooks: v.array(webhookSchema)
});

export interface AuditLog extends v.InferOutput<typeof auditLogSchema> {}
