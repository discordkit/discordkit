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
 * Returns a {@link TargetUsersJobStatus | TargetUsersJobStatus} object
 * describing the current job state.
 */
export const getTargetUsersJobStatus: Fetcher<
  typeof getTargetUsersJobStatusSchema,
  TargetUsersJobStatus
> = async ({ code }) => get(`/invites/${code}/target-users/job-status`);
