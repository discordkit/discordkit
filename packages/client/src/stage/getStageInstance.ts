import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { stageSchema, type Stage } from "./types/Stage.js";

export const getStageInstanceSchema = v.object({
  channel: snowflake
});

/**
 * ### [Get Stage Instance](https://discord.com/developers/docs/resources/stage-instance#get-stage-instance)
 *
 * **GET** `/stage-instances/:channel`
 *
 * Gets the {@link Stage | stage instance} associated with the Stage channel, if it exists.
 */
export const getStageInstance: Fetcher<
  typeof getStageInstanceSchema,
  Stage
> = async ({ channel }) => get(`/stage-instances/${channel}`);

export const getStageInstanceSafe = toValidated(
  getStageInstance,
  getStageInstanceSchema,
  stageSchema
);

export const getStageInstanceProcedure = toProcedure(
  `query`,
  getStageInstance,
  getStageInstanceSchema,
  stageSchema
);

export const getStageInstanceQuery = toQuery(getStageInstance);
