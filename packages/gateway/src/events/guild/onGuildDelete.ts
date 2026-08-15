import { dispatchEvent } from "../dispatch.js";
import type { UnavailableGuild } from "../lifecycle/types/Ready.js";

/**
 * ### [Guild Delete](https://discord.com/developers/docs/events/gateway-events#guild-delete)
 *
 * Sent when a guild becomes or was already unavailable due to an outage, or
 * when the user leaves or is removed from a guild. The inner payload is an
 * unavailable guild object.
 *
 * The two cases are distinguished by `unavailable`: when it is set the guild is
 * merely offline and will come back via {@link onGuildCreate | Guild Create};
 * when the field is **absent** the user was actually removed.
 *
 * Gated by `GUILDS`.
 */
export const onGuildDelete = dispatchEvent<
  Partial<UnavailableGuild>,
  `GUILD_DELETE`
>(`GUILD_DELETE`, [`GUILDS`]);
