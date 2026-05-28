import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type ActivityInstance } from "./types/ActivityInstance.js";

export const getApplicationActivityInstanceSchema = v.object({
  application: snowflake,
  instanceId: v.string()
});

/**
 * ### [Get Application Activity Instance](https://discord.com/developers/docs/resources/application#get-application-activity-instance)
 *
 * **GET** `/applications/:application/activity-instances/:instanceId`
 *
 * Returns a serialized {@link ActivityInstance | activity instance}, if it exists. Useful for [preventing unwanted activity sessions](https://discord.com/developers/docs/activities/development-guides/multiplayer-experience#preventing-unwanted-activity-sessions).
 */
export const getApplicationActivityInstance: Fetcher<
  typeof getApplicationActivityInstanceSchema,
  ActivityInstance
> = async ({ application, instanceId }) =>
  get(`/applications/${application}/activity-instances/${instanceId}`);
