import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { activityLocationKindSchema } from "./ActivityLocationKind.js";

/**
 * ### [Activity Location Object](https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-location-object)
 *
 * The Activity Location is an object that describes the location in which an activity instance is running.
 */
export const activityLocationSchema = v.object({
  /** Unique identifier for the location */
  id: v.string(),
  /** Enum describing kind of location */
  kind: activityLocationKindSchema,
  /** ID of the {@link Channel | Channel} */
  channelId: snowflake,
  /** ID of the {@link Guild | Guild} */
  guildId: v.nullish(snowflake)
});

export interface ActivityLocation extends v.InferOutput<
  typeof activityLocationSchema
> {}
