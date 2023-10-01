import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.ts";
import { auditLogEventSchema } from "./AuditLogEvent.ts";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.ts";

export const auditLogEntrySchema = z.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: z.string().nullable(),
  /** Changes made to the targetId */
  changes: auditLogChangeSchema.array().nullable(),
  /** User or app that made the changes */
  userId: snowflake.nullable(),
  /** ID of the entry */
  id: snowflake,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: optionalAuditEntryInfoSchema.nullable(),
  /** Reason for the change (1-512 characters) */
  reason: z.string().min(1).max(512).nullable()
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
