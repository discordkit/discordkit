import { snowflake } from "@discordkit/core";
import {
  type GenericSchema,
  type InferOutput,
  nonEmpty,
  object,
  partial,
  picklist,
  pipe,
  string
} from "valibot";

export const optionalAuditEntryInfoSchema = partial(
  object({
    /** ID of the app whose permissions were targeted */
    applicationId: snowflake as GenericSchema<string>,
    /** Name of the Auto Moderation rule that was triggered */
    autoModerationRuleName: pipe(string(), nonEmpty()) as GenericSchema<string>,
    /** Trigger type of the Auto Moderation rule that was triggered */
    autoModerationRuleTriggerType: pipe(
      string(),
      nonEmpty()
    ) as GenericSchema<string>,
    /** Channel in which the entities were targeted */
    channelId: snowflake as GenericSchema<string>,
    /** Number of entities that were targeted */
    count: pipe(string(), nonEmpty()) as GenericSchema<string>,
    /** Number of days after which inactive members were kicked */
    deleteMemberDays: pipe(string(), nonEmpty()) as GenericSchema<string>,
    /** ID of the overwritten entity */
    id: snowflake as GenericSchema<string>,
    /** Number of members removed by the prune */
    membersRemoved: pipe(string(), nonEmpty()) as GenericSchema<string>,
    /** ID of the message that was targeted */
    messageId: snowflake as GenericSchema<string>,
    /** Name of the role if type is "0" (not present if type is "1") */
    roleName: picklist([`0`, `1`]),
    /** Type of overwritten entity - role ("0") or member ("1") */
    type: picklist([`0`, `1`]),
    /** The type of integration which performed the action */
    integrationType: pipe(string(), nonEmpty()) as GenericSchema<string>
  })
);

export interface OptionalAuditEntryInfo
  extends InferOutput<typeof optionalAuditEntryInfoSchema> {}
