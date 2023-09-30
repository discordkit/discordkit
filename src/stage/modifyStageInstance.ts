import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";
import { type Stage, stageSchema } from "./types/Stage.ts";
import { stagePrivacyLevelSchema } from "./types/StagePrivacyLevel.ts";

export const modifyStageInstanceSchema = z.object({
  channel: z.string().min(1),
  body: z
    .object({
      /** The topic of the Stage instance (1-120 characters) */
      topic: z.string().min(1).max(120),
      /** The privacy level of the Stage instance */
      privacyLevel: stagePrivacyLevelSchema
    })
    .partial()
});

/**
 * ### [Modify Stage Instance](https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance)
 *
 * **PATCH** `/stage-instances/:channel`
 *
 * Updates fields of an existing Stage instance. Returns the updated {@link Stage | Stage instance}. Fires a Stage Instance Update Gateway event.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyStageInstance: Fetcher<
  typeof modifyStageInstanceSchema,
  Stage
> = async ({ channel, body }) => patch(`/stage-instances/${channel}`, body);

export const modifyStageInstanceSafe = toValidated(
  modifyStageInstance,
  modifyStageInstanceSchema,
  stageSchema
);

export const modifyStageInstanceProcedure = toProcedure(
  `mutation`,
  modifyStageInstance,
  modifyStageInstanceSchema,
  stageSchema
);
