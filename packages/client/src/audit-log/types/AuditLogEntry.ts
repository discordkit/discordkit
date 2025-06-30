import {
  object,
  string,
  array,
  maxLength,
  type InferOutput,
  pipe,
  nullable,
  exactOptional,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { auditLogChangeSchema } from "./AuditLogChange.js";
import { auditLogEventSchema } from "./AuditLogEvent.js";
import { optionalAuditEntryInfoSchema } from "./OptionalAuditEntryInfo.js";

export const auditLogEntrySchema = object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  targetId: nullable(pipe(string(), nonEmpty())),
  /** Changes made to the targetId */
  changes: exactOptional(array(auditLogChangeSchema)),
  /** User or app that made the changes */
  userId: nullable(snowflake),
  /** ID of the entry */
  id: snowflake,
  /** Type of action that occurred */
  actionType: auditLogEventSchema,
  /** Additional info for certain event types */
  options: exactOptional(optionalAuditEntryInfoSchema),
  /** Reason for the change (1-512 characters) */
  reason: exactOptional(pipe(string(), nonEmpty(), maxLength(512)))
});

export type AuditLogEntry = InferOutput<typeof auditLogEntrySchema>;
