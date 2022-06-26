import { z } from "zod";
import { get, query } from "../utils";
import { AuditLogEvent } from "./types";
import type { AuditLog } from "./types";

export const getGuildAuditLogSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** Entries from a specific user ID */
      userId: z.string().min(1),
      /** Entries for a specific audit log event */
      actionType: z.nativeEnum(AuditLogEvent),
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
export const getGuildAuditLog = query(getGuildAuditLogSchema, ({ guild, params }) =>
  get<AuditLog>(`/guilds/${guild}/audit-logs`, params)
);
