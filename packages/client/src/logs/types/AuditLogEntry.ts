import {
  object,
  string,
  nullish,
  array,
  minLength,
  maxLength,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.js";
import { auditLogEventSchema } from "./AuditLogEvent.js";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.js";

export const auditLogEntrySchema = object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: nullish(string()),
  /** Changes made to the targetId */
  changes: nullish(array(auditLogChangeSchema)),
  /** User or app that made the changes */
  userId: nullish(snowflake),
  /** ID of the entry */
  id: snowflake,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: nullish(optionalAuditEntryInfoSchema),
  /** Reason for the change (1-512 characters) */
  reason: nullish(pipe(string(), minLength(1), maxLength(512)))
});

export type AuditLogEntry = InferOutput<typeof auditLogEntrySchema>;
