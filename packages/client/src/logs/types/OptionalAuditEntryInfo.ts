import { snowflake } from "@discordkit/core";
import { type InferOutput, object, partial, string } from "valibot";

export const optionalAuditEntryInfoSchema = partial(
  object({
    /** ID of the app whose permissions were targeted */
    applicationId: snowflake,
    /** Name of the Auto Moderation rule that was triggered */
    autoModerationRuleName: string(),
    /** Trigger type of the Auto Moderation rule that was triggered */
    autoModerationRuleTriggerType: string(),
    /** Channel in which the entities were targeted */
    channelId: snowflake,
    /** Number of entities that were targeted */
    count: string(),
    /** Number of days after which inactive members were kicked */
    deleteMemberDays: string(),
    /** ID of the overwritten entity */
    id: snowflake,
    /** Number of members removed by the prune */
    membersRemoved: string(),
    /** ID of the message that was targeted */
    messageId: snowflake,
    /** Name of the role if type is "0" (not present if type is "1") */
    roleName: string(),
    /** Type of overwritten entity - role ("0") or member ("1") */
    type: string(),
    /** The type of integration which performed the action */
    integrationType: string()
  })
);

export type OptionalAuditEntryInfo = InferOutput<
  typeof optionalAuditEntryInfoSchema
>;
