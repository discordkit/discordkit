import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { type AuditLog, auditLogSchema } from "./types/AuditLog";
import { auditLogEventSchema } from "./types/AuditLogEvent";

export const getGuildAuditLogSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** Entries from a specific user ID */
      userId: z.string().min(1).nullable(),
      /** Entries for a specific audit log event */
      actionType: auditLogEventSchema.nullable(),
      /** Entries that preceded a specific audit log entry ID */
      before: z.string().min(1).nullable(),
      /** Entries with ID greater than a specific audit log entry ID */
      after: z.string().min(1).nullable(),
      /** Maximum number of entries (between 1-100) to return, defaults to 50 */
      limit: z.number().min(1).max(100).nullable()
    })
    .partial()
    .optional()
});

/**
 * ### [Get Guild Audit Log](https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log)
 *
 * **GET** `/guilds/:guild/audit-logs`
 *
 * Returns an {@link AuditLog | audit log object} for the guild. Requires the `VIEW_AUDIT_LOG` permission.
 *
 * The returned list of audit log entries is ordered based on whether you use `before` or `after`. When using `before`, the list is ordered by the audit log entry ID descending (newer entries first). If `after` is used, the list is reversed and appears in ascending order (older entries first). Omitting both `before` and `after` defaults to `before` the current timestamp and will show the most recent entries in descending order by ID, the opposite can be achieved using `after=0` (showing oldest entries).
 */
export const getGuildAuditLog: Fetcher<
  typeof getGuildAuditLogSchema,
  AuditLog
> = async ({ guild, params }) => get(`/guilds/${guild}/audit-logs`, params);

export const getGuildAuditLogProcedure = toProcedure(
  `query`,
  getGuildAuditLog,
  getGuildAuditLogSchema,
  auditLogSchema
);

export const getGuildAuditLogQuery = toQuery(getGuildAuditLog);
