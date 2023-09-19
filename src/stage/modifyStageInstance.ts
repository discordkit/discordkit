import { z } from "zod";
import { patch, type Fetcher, createProcedure } from "../utils";
import { type Stage, stagePrivacyLevelSchema, stageSchema } from "./types";

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
 * Updates fields of an existing Stage instance. Returns the updated Stage instance.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance
 */
export const modifyStageInstance: Fetcher<
  typeof modifyStageInstanceSchema,
  Stage
> = async ({ channel, body }) => patch(`/stage-instances/${channel}`, body);

export const modifyStageInstanceProcedure = createProcedure(
  `mutation`,
  modifyStageInstance,
  modifyStageInstanceSchema,
  stageSchema
);
