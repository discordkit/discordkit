import {
  boolean,
  maxLength,
  minLength,
  nullish,
  object,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type Stage, stageSchema } from "./types/Stage.js";
import { stagePrivacyLevelSchema } from "./types/StagePrivacyLevel.js";

export const createStageInstanceSchema = object({
  body: object({
    /** The id of the Stage channel */
    channelId: snowflake,
    /** The topic of the Stage instance (1-120 characters) */
    topic: string([minLength(1), maxLength(120)]),
    /** The privacy level of the Stage instance (default GUILD_ONLY) */
    privacyLevel: nullish(stagePrivacyLevelSchema),
    /** Notify @everyone that a Stage instance has started */
    sendStartNotification: nullish(boolean())
  })
});

/**
 * ### [Create Stage Instance](https://discord.com/developers/docs/resources/stage-instance#create-stage-instance)
 *
 * **POST** `/stage-instances`
 *
 * Creates a new Stage instance associated to a Stage channel. Returns that {@link Stage | Stage instance}. Fires a Stage Instance Create Gateway event.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createStageInstance: Fetcher<
  typeof createStageInstanceSchema,
  Stage
> = async ({ body }) => post(`/stage-instances`, body);

export const createStageInstanceSafe = toValidated(
  createStageInstance,
  createStageInstanceSchema,
  stageSchema
);

export const createStageInstanceProcedure = toProcedure(
  `mutation`,
  createStageInstance,
  createStageInstanceSchema,
  stageSchema
);
