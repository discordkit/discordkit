import * as v from "valibot";

/**
 * ### [Activity Location Kind Enum](https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-kind-enum)
 *
 * Describes the kind of location an activity instance is running in.
 */
export enum ActivityLocationKind {
  /** Location is a Guild Channel */
  GUILD_CHANNEL = `gc`,
  /** Location is a Private Channel, such as a DM or GDM */
  PRIVATE_CHANNEL = `pc`
}

export const activityLocationKindSchema = v.enum_(ActivityLocationKind);
