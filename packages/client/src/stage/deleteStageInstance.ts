import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteStageInstanceSchema = object({
  channel: snowflake
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
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteStageInstance: Fetcher<
  typeof deleteStageInstanceSchema
> = async ({ channel }) => remove(`/stage-instances/${channel}`);

export const deleteStageInstanceSafe = toValidated(
  deleteStageInstance,
  deleteStageInstanceSchema
);

export const deleteStageInstanceProcedure = toProcedure(
  `mutation`,
  deleteStageInstance,
  deleteStageInstanceSchema
);
