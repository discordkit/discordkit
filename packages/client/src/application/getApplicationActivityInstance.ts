import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ActivityInstance } from "./types/ActivityInstance.js";

export const getApplicationActivityInstanceSchema = v.object({
  application: snowflake,
  instanceId: v.string()
});

/**
 * ### [Get Application Activity Instance](https://discord.com/developers/docs/resources/application#get-application-activity-instance)
 *
 * **GET** `/applications/:application/activity-instances/:instanceId`
 *
 * Returns a serialized {@link ActivityInstance | activity instance}, if it exists. Useful for preventing unwanted activity sessions.
 *
 * **Example Activity Instance**
 *
 * ```json
 * {
 *   "application_id": "1215413995645968394",
 *   "instance_id": "i-1276580072400224306-gc-912952092627435520-912954213460484116",
 *   "launch_id": "1276580072400224306",
 *   "location": {
 *     "id": "gc-912952092627435520-912954213460484116",
 *     "kind": "gc",
 *     "channel_id": "912954213460484116",
 *     "guild_id": "912952092627435520"
 *   },
 *   "users": ["205519959982473217"],
 * }
 * ```
 */
export const getApplicationActivityInstance: Fetcher<
  typeof getApplicationActivityInstanceSchema,
  ActivityInstance
> = async ({ application, instanceId }) =>
  get(`/applications/${application}/activity-instances/${instanceId}`);
