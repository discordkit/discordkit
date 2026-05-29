import * as v from "valibot";
import { get, type Fetcher, boundedString } from "@discordkit/core";
import { type TargetUsersJobStatus } from "./types/TargetUsersJobStatus.js";

export const getTargetUsersJobStatusSchema = v.object({
  code: boundedString()
});

/**
 * ### [Get Target Users Job Status](https://discord.com/developers/docs/resources/invite#get-target-users-job-status)
 *
 * **GET** `/invites/:code/target-users/job-status`
 *
 * Processing target users from a CSV when creating or updating an invite is done asynchronously. This endpoint allows you to check the status of that job. Requires the caller to be the inviter, or have `MANAGE_GUILD` permission, or have `VIEW_AUDIT_LOG` permission.
 *
 * **Example Response**
 *
 * ```json
 * {
 *   "status": 3,
 *   "total_users": 100,
 *   "processed_users": 41,
 *   "created_at": "2025-01-08T12:00:00.000000+00:00",
 *   "completed_at": null,
 *   "error_message": "Failed to parse CSV file"
 * }
 * ```
 *
 * @remarks
 * Returns a {@link TargetUsersJobStatus | TargetUsersJobStatus} object describing the current job state.
 */
export const getTargetUsersJobStatus: Fetcher<
  typeof getTargetUsersJobStatusSchema,
  TargetUsersJobStatus
> = async ({ code }) => get(`/invites/${code}/target-users/job-status`);
