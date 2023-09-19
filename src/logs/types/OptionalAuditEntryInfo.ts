import { z } from "zod";

export const optionalAuditEntryInfoSchema = z.object({
  /** ID of the app whose permissions were targeted */
  applicationId: z.string().optional(),
  /** Channel in which the entities were targeted */
  channelId: z.string().optional(),
  /** Number of entities that were targeted */
  count: z.string().optional(),
  /** Number of days after which inactive members were kicked */
  deleteMemberDays: z.string().optional(),
  /** ID of the overwritten entity */
  id: z.string().optional(),
  /** Number of members removed by the prune */
  membersRemoved: z.string().optional(),
  /** ID of the message that was targeted */
  messageId: z.string().optional(),
  /** Name of the role if type is "0" (not present if type is "1") */
  roleName: z.string().optional(),
  /** Type of overwritten entity - role ("0") or member ("1") */
  type: z.string().optional()
});

export type OptionalAuditEntryInfo = z.infer<
  typeof optionalAuditEntryInfoSchema
>;
