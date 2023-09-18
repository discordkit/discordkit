import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Stage } from "./types";

export const getStageInstanceSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Gets the stage instance associated with the Stage channel, if it exists.
 *
 * https://discord.com/developers/docs/resources/stage-instance#get-stage-instance
 */
export const getStageInstance: Fetcher<
  typeof getStageInstanceSchema,
  Stage
> = async ({ channel }) => get(`/stage-instances/${channel}`);
