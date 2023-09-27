import { z } from "zod";
import { auditLogChangeSchema } from "./AuditLogChange";
import { auditLogEventSchema } from "./AuditLogEvent";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo";

export const auditLogEntrySchema = z.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: z.union([z.string(), z.null()]),
  /** Changes made to the targetId */
  changes: auditLogChangeSchema.array().nullable(),
  /** User or app that made the changes */
  userId: z.string().nullable(),
  /** ID of the entry */
  id: z.string(),
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: optionalAuditEntryInfoSchema.nullable(),
  /** Reason for the change (1-512 characters) */
  reason: z.string().min(1).max(512).nullable()
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
