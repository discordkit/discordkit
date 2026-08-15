import type { Stage } from "@discordkit/client/stage/types/Stage";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Stage Instance Create](https://discord.com/developers/docs/events/gateway-events#stage-instance-create)
 *
 * Sent when a stage instance is created — a stage channel goes live.
 *
 * Gated by `GUILDS`.
 */
export const onStageInstanceCreate = dispatchEvent<
  Stage,
  `STAGE_INSTANCE_CREATE`
>(`STAGE_INSTANCE_CREATE`);
