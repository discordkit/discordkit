import type { Stage } from "@discordkit/client/stage/types/Stage";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Stage Instance Delete](https://discord.com/developers/docs/events/gateway-events#stage-instance-delete)
 *
 * Sent when a stage instance is deleted — the stage has ended.
 *
 * Gated by `GUILDS`.
 */
export const onStageInstanceDelete = dispatchEvent<
  Stage,
  `STAGE_INSTANCE_DELETE`
>(`STAGE_INSTANCE_DELETE`);
