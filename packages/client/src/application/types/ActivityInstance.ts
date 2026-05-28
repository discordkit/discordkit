import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { activityLocationSchema } from "./ActivityLocation.js";

/**
 * ### [Activity Instance Object](https://discord.com/developers/docs/resources/application#get-application-activity-instance-activity-instance-object)
 *
 * A serialized activity instance, returned by the Get Application Activity Instance endpoint.
 */
export const activityInstanceSchema = v.object({
  /** {@link Application | Application} ID */
  applicationId: snowflake,
  /** Activity Instance ID */
  instanceId: v.string(),
  /** Unique identifier for the launch */
  launchId: snowflake,
  /** Location the instance is running in */
  location: activityLocationSchema,
  /** IDs of the {@link User | Users} currently connected to the instance */
  users: v.array(snowflake)
});

export interface ActivityInstance extends v.InferOutput<
  typeof activityInstanceSchema
> {}
