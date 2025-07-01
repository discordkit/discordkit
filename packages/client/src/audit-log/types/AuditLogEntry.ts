import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.js";
import { auditLogEventSchema } from "./AuditLogEvent.js";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.js";

export const auditLogEntrySchema = v.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** Changes made to the targetId */
  changes: v.exactOptional(v.array(auditLogChangeSchema)),
  /** User or app that made the changes */
  userId: v.nullable<v.GenericSchema<string>>(snowflake),
  /** ID of the entry */
  id: snowflake as v.GenericSchema<string>,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: v.exactOptional(optionalAuditEntryInfoSchema),
  /** Reason for the change (1-512 characters) */
  reason: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty(), v.maxLength(512))
  )
});

export interface AuditLogEntry
  extends v.InferOutput<typeof auditLogEntrySchema> {}
