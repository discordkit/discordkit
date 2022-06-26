import { z } from "zod";
import { mutation, patch } from "../utils";
import { StagePrivacyLevel } from "./types";
import type { Stage } from "./types";

export const modifyStageInstanceSchema = z.object({
  channel: z.string().min(1),
  body: z
    .object({
      /** The topic of the Stage instance (1-120 characters) */
      topic: z.string().min(1).max(120),
      /** The privacy level of the Stage instance */
      privacyLevel: z.nativeEnum(StagePrivacyLevel)
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
export const modifyStageInstance = mutation(modifyStageInstanceSchema, async ({ channel, body }) =>
  patch<Stage>(`/stage-instances/${channel}`, body)
);
