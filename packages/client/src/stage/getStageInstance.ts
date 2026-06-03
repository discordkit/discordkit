import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Stage } from "./types/Stage.js";

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
