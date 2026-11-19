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
 *
 * > [!NOTE]
 * >
 * > If the presence author's [Profile Privacy Setting](https://support.discord.com/hc/en-us/articles/38859942749463-Profile-Privacy-Setting-on-Discord) is set to `Friends Only`, or to `Friends & Small Servers Only` in a guild with more than 200 members, their custom status (activity type `4`) is omitted from `activities` in events dispatched to that guild. This applies to any subscription to the guild's presence, including bots and apps. Other activity types are not affected by this setting.
 */
export const onPresenceUpdate = dispatchEvent<
  PresenceUpdate,
  `PRESENCE_UPDATE`
>(`PRESENCE_UPDATE`, [`GUILD_PRESENCES`]);
