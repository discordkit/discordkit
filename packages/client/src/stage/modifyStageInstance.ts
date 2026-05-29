import * as v from "valibot";
import {
  patch,
  type Fetcher,
  snowflake,
  boundedString
} from "@discordkit/core";
import { type Stage } from "./types/Stage.js";
import { stagePrivacyLevelSchema } from "./types/StagePrivacyLevel.js";

export const modifyStageInstanceSchema = v.object({
  channel: snowflake,
  body: v.partial(
    v.object({
      /** The topic of the Stage instance (1-120 characters) */
      topic: boundedString({ max: 120 }),
      /** The privacy level of the Stage instance */
      privacyLevel: stagePrivacyLevelSchema
    })
  )
});

/**
 * ### [Modify Stage Instance](https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance)
 *
 * **PATCH** `/stage-instances/:channel`
 *
 * Updates fields of an existing {@link Stage | Stage instance}. Returns the updated {@link Stage | Stage instance}. Fires a Stage Instance Update Gateway event.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyStageInstance: Fetcher<
  typeof modifyStageInstanceSchema,
  Stage,
  { auditLogReason: true }
> = async ({ channel, body }, options) =>
  patch(`/stage-instances/${channel}`, body, options);
