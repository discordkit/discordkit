import type { AuditLogChange } from "./AuditLogChange";
import type { AuditLogEvent } from "./AuditLogEvent";
import type { OptionalAuditEntryInfo } from "./OptionalAuditEntryInfo";

export interface AuditLogEntry {
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: string | null;
  /** Changes made to the target_id */
  changes?: AuditLogChange[];
  /** User or app that made the changes */
  userId: string | null;
  /** ID of the entry */
  id: string;
  /** Type of action that occurred */
  actionType: AuditLogEvent;
  /** Additional info for certain event types */
  options?: OptionalAuditEntryInfo;
  /** Reason for the change (1-512 characters) */
  reason?: string;
}
