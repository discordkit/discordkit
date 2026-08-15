import { dispatchEvent } from "../dispatch.js";
import type { PresenceUpdate } from "./types/PresenceEvents.js";

/**
 * ### [Presence Update](https://discord.com/developers/docs/events/gateway-events#presence-update)
 *
 * Sent when a user's presence or info — status, activities, platform — changes.
 *
 * > [!WARNING]
 * >
 * > Gated by the **privileged** `GUILD_PRESENCES` intent, which must be enabled
 * > in the Developer Portal. Without it this event never arrives, silently.
 */
export const onPresenceUpdate = dispatchEvent<
  PresenceUpdate,
  `PRESENCE_UPDATE`
>(`PRESENCE_UPDATE`, [`GUILD_PRESENCES`]);
