import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.ts";
import { auditLogEventSchema } from "./AuditLogEvent.ts";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.ts";

export const auditLogEntrySchema = z.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: z.string().nullish(),
  /** Changes made to the targetId */
  changes: auditLogChangeSchema.array().nullish(),
  /** User or app that made the changes */
  userId: snowflake.nullish(),
  /** ID of the entry */
  id: snowflake,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: optionalAuditEntryInfoSchema.nullish(),
  /** Reason for the change (1-512 characters) */
  reason: z.string().min(1).max(512).nullish()
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
