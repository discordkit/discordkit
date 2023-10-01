import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const optionalAuditEntryInfoSchema = z
  .object({
    /** ID of the app whose permissions were targeted */
    applicationId: snowflake,
    /** Name of the Auto Moderation rule that was triggered */
    autoModerationRuleName: z.string(),
    /** Trigger type of the Auto Moderation rule that was triggered */
    autoModerationRuleTriggerType: z.string(),
    /** Channel in which the entities were targeted */
    channelId: snowflake,
    /** Number of entities that were targeted */
    count: z.string(),
    /** Number of days after which inactive members were kicked */
    deleteMemberDays: z.string(),
    /** ID of the overwritten entity */
    id: snowflake,
    /** Number of members removed by the prune */
    membersRemoved: z.string(),
    /** ID of the message that was targeted */
    messageId: snowflake,
    /** Name of the role if type is "0" (not present if type is "1") */
    roleName: z.string(),
    /** Type of overwritten entity - role ("0") or member ("1") */
    type: z.string(),
    /** The type of integration which performed the action */
    integrationType: z.string()
  })
  .partial();

export type OptionalAuditEntryInfo = z.infer<
  typeof optionalAuditEntryInfoSchema
>;
