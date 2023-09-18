import { z } from "zod";
import { post, type Fetcher } from "../utils";
import { type Stage, stagePrivacyLevel } from "./types";

export const createStageInstanceSchema = z.object({
  body: z.object({
    /** The id of the Stage channel */
    channelId: z.string().min(1),
    /** The topic of the Stage instance (1-120 characters) */
    topic: z.string().min(1).max(120),
    /** The privacy level of the Stage instance (default GUILD_ONLY) */
    privacyLevel: stagePrivacyLevel.optional(),
    /** Notify @everyone that a Stage instance has started */
    sendStartNotification: z.boolean().optional()
  })
});

/**
 * Creates a new Stage instance associated to a Stage channel. Returns that Stage instance.
 *
 * Requires the user to be a moderator of the Stage channel.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/stage-instance#create-stage-instance
 */
export const createStageInstance: Fetcher<
  typeof createStageInstanceSchema,
  Stage
> = async ({ body }) => post(`/stage-instances`, body);
