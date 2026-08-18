import type { Stage } from "@discordkit/client/stage/types/Stage";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Stage Instance Update](https://discord.com/developers/docs/events/gateway-events#stage-instance-update)
 *
 * Sent when a stage instance is updated.
 *
 * Gated by `GUILDS`.
 */
export const onStageInstanceUpdate = dispatchEvent<
  Stage,
  `STAGE_INSTANCE_UPDATE`
>(`STAGE_INSTANCE_UPDATE`, [`GUILDS`]);
