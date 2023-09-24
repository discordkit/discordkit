import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { type AuditLog, auditLogSchema } from "./types/AuditLog";
import { auditLogEventSchema } from "./types/AuditLogEvent";

export const getGuildAuditLogSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** Entries from a specific user ID */
      userId: z.string().min(1),
      /** Entries for a specific audit log event */
      actionType: auditLogEventSchema,
      /** Entries that preceded a specific audit log entry ID */
      before: z.string().min(1),
      /** Maximum number of entries (between 1-100) to return, defaults to 50 */
      limit: z.number().min(1).max(100)
    })
    .partial()
    .optional()
});

/**
 * Returns an audit log object for the guild. Requires the [`VIEW_AUDIT_LOG`](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags) permission.
 *
 * https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log
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
