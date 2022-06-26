import { z } from "zod";
import { get, query } from "../utils";
import type { Stage } from "./types";

export const getStageInstanceSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Gets the stage instance associated with the Stage channel, if it exists.
 *
 * https://discord.com/developers/docs/resources/stage-instance#get-stage-instance
 */
export const getStageInstance = query(getStageInstanceSchema, ({ channel }) =>
  get<Stage>(`/stage-instances/${channel}`)
);
