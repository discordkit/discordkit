import {
  integer,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  exactOptional,
  partial,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type AuditLog, auditLogSchema } from "./types/AuditLog.js";
import { auditLogEventSchema } from "./types/AuditLogEvent.js";

export const getGuildAuditLogSchema = object({
  guild: snowflake,
  params: exactOptional(
    partial(
      object({
        /** Entries from a specific user ID */
        userId: nullish(snowflake),
        /** Entries for a specific audit log event */
        actionType: nullish(auditLogEventSchema),
        /** Entries that preceded a specific audit log entry ID */
        before: nullish(snowflake),
        /** Entries with ID greater than a specific audit log entry ID */
        after: nullish(snowflake),
        /** Maximum number of entries (between 1-100) to return, defaults to 50 */
        limit: nullish(pipe(number(), integer(), minValue(1), maxValue(100)))
      })
    )
  )
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

export const getGuildAuditLogSafe = toValidated(
  getGuildAuditLog,
  getGuildAuditLogSchema,
  auditLogSchema
);

export const getGuildAuditLogProcedure = toProcedure(
  `query`,
  getGuildAuditLog,
  getGuildAuditLogSchema,
  auditLogSchema
);

export const getGuildAuditLogQuery = toQuery(getGuildAuditLog);
