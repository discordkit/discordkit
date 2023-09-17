import { z } from "zod";
import { auditLogChange } from "./AuditLogChange";
import { auditLogEvent } from "./AuditLogEvent";
import { optionalAuditEntryInfo } from "./OptionalAuditEntryInfo";

export const auditLogEntry = z.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: z.union([z.string(), z.null()]),
  /** Changes made to the target_id */
  changes: auditLogChange.array().optional(),
  /** User or app that made the changes */
  userId: z.union([z.string(), z.null()]),
  /** ID of the entry */
  id: z.string(),
  /** Type of action that occurred */
  actionType: auditLogEvent,
  /** Additional info for certain event types */
  options: optionalAuditEntryInfo.optional(),
  /** Reason for the change (1-512 characters) */
  reason: z.string().optional()
});

export type AuditLogEntry = z.infer<typeof auditLogEntry>;
