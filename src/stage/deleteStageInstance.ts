import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteStageInstanceSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Deletes the Stage instance. Returns `204 No Content`.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance
 */
export const deleteStageInstance = mutation(deleteStageInstanceSchema, async ({ channel }) =>
  remove(`/stage-instances/${channel}`)
);
