import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const deleteStageInstanceSchema = z.object({
  channel: z.string().min(1)
});

/**
 * ### [Delete Stage Instance](https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance)
 *
 * **DELETE* `/stage-instances/:channel`
 *
 * Deletes the Stage instance. Returns `204 No Content`. Fires a Stage Instance Delete Gateway event.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteStageInstance: Fetcher<
  typeof deleteStageInstanceSchema
> = async ({ channel }) => remove(`/stage-instances/${channel}`);

export const deleteStageInstanceProcedure = toProcedure(
  `mutation`,
  deleteStageInstance,
  deleteStageInstanceSchema
);
