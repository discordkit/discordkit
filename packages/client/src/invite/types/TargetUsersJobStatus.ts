import * as v from "valibot";

/**
 * ### [Target Users Job Status Codes](https://discord.com/developers/docs/resources/invite#get-target-users-job-status-status-codes)
 *
 * Status codes returned by the Get Target Users Job Status endpoint.
 */
export enum TargetUsersJobStatusCode {
  /** The default value. */
  UNSPECIFIED = 0,
  /** The job is still being processed. */
  PROCESSING = 1,
  /** The job has been completed successfully. */
  COMPLETED = 2,
  /** The job has failed, see `errorMessage` field for more details. */
  FAILED = 3
}

export const targetUsersJobStatusCodeSchema = v.enum_(TargetUsersJobStatusCode);

/**
 * ### Target Users Job Status
 *
 * Response shape from the Get Target Users Job Status endpoint.
 */
export const targetUsersJobStatusSchema = v.object({
  /** Current job status */
  status: targetUsersJobStatusCodeSchema,
  /** Total number of users in the input CSV */
  totalUsers: v.pipe(v.number(), v.integer()),
  /** Number of users processed so far */
  processedUsers: v.pipe(v.number(), v.integer()),
  /** When the job was created */
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  /** When the job completed; null if not yet completed */
  completedAt: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  /** Error message if the job failed; null otherwise */
  errorMessage: v.nullable(v.string())
});

export interface TargetUsersJobStatus
  extends v.InferOutput<typeof targetUsersJobStatusSchema> {}
