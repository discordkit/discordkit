import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const optionalAuditEntryInfoSchema = v.partial(
  v.object({
    /** ID of the app whose permissions were targeted */
    applicationId: snowflake as v.GenericSchema<string>,
    /** Name of the Auto Moderation rule that was triggered */
    autoModerationRuleName: v.pipe(
      v.string(),
      v.nonEmpty()
    ) as v.GenericSchema<string>,
    /** Trigger type of the Auto Moderation rule that was triggered */
    autoModerationRuleTriggerType: v.pipe(
      v.string(),
      v.nonEmpty()
    ) as v.GenericSchema<string>,
    /** Channel in which the entities were targeted */
    channelId: snowflake as v.GenericSchema<string>,
    /** Number of entities that were targeted */
    count: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
    /** Number of days after which inactive members were kicked */
    deleteMemberDays: v.pipe(
      v.string(),
      v.nonEmpty()
    ) as v.GenericSchema<string>,
    /** ID of the overwritten entity */
    id: snowflake as v.GenericSchema<string>,
    /** Number of members removed by the prune */
    membersRemoved: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
    /** ID of the message that was targeted */
    messageId: snowflake as v.GenericSchema<string>,
    /** Name of the role if type is "0" (not present if type is "1") */
    roleName: v.picklist([`0`, `1`]),
    /** Type of overwritten entity - role ("0") or member ("1") */
    type: v.picklist([`0`, `1`]),
    /** The type of integration which performed the action */
    integrationType: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>
  })
);

export interface OptionalAuditEntryInfo
  extends v.InferOutput<typeof optionalAuditEntryInfoSchema> {}
