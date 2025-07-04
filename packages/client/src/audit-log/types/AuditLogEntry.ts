import * as v from "valibot";
import { boundedString, snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.js";
import { auditLogEventSchema } from "./AuditLogEvent.js";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.js";

export const auditLogEntrySchema = v.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: v.nullable(boundedString()),
  /** Changes made to the targetId */
  changes: v.exactOptional(v.array(auditLogChangeSchema)),
  /** User or app that made the changes */
  userId: v.nullable(snowflake),
  /** ID of the entry */
  id: snowflake,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: v.exactOptional(optionalAuditEntryInfoSchema),
  /** Reason for the change (1-512 characters) */
  reason: v.exactOptional(boundedString({ max: 512 }))
});

export interface AuditLogEntry
  extends v.InferOutput<typeof auditLogEntrySchema> {}
