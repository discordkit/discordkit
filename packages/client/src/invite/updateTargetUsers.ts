import * as v from "valibot";
import {
  put,
  type Fetcher,
  boundedString,
  fileUpload,
  multipart
} from "@discordkit/core";

export const updateTargetUsersSchema = v.object({
  code: boundedString(),
  body: multipart({
    /** a CSV file with a single column of user IDs for all the users able to accept this invite */
    targetUsersFile: fileUpload
  })
});

/**
 * ### [Update Target Users](https://discord.com/developers/docs/resources/invite#update-target-users)
 *
 * **PUT** `/invites/:code/target-users`
 *
 * Updates the users allowed to see and accept this invite. Uploading a file with invalid user IDs will result in a 400 with the invalid IDs described. Requires the caller to be the inviter or have the `MANAGE_GUILD` permission.
 *
 * Processing target users from a CSV is done asynchronously — poll
 * {@link getTargetUsersJobStatus | Get Target Users Job Status} to
 * monitor completion.
 *
 * @example
 * Example error response when invalid user IDs are submitted:
 * ```json
 * {
 *   "target_users_file": [
 *     "Line 5: invalid user ID - must be a valid Discord snowflake",
 *     "Line 6: invalid user ID format"
 *   ]
 * }
 * ```
 */
export const updateTargetUsers: Fetcher<
  typeof updateTargetUsersSchema
> = async ({ code, body }) => put(`/invites/${code}/target-users`, body);
