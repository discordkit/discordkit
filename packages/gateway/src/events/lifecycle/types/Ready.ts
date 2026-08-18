// https://discord.com/developers/docs/events/gateway-events#ready

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { applicationFlag } from "@discordkit/client/application/types/ApplicationFlags";
import { userSchema } from "@discordkit/client/user/types/User";

/**
 * ### [Unavailable Guild](https://discord.com/developers/docs/resources/guild#unavailable-guild-object)
 *
 * A guild the bot is in but whose data hasn't arrived yet. `READY` lists every
 * guild this way; each becomes available via a later `GUILD_CREATE`.
 */
const _unavailableGuildSchema = v.object({
  id: snowflake,
  unavailable: v.literal(true)
});

export interface UnavailableGuild extends v.InferOutput<
  typeof _unavailableGuildSchema
> {}

export const unavailableGuildSchema = schema<UnavailableGuild>(
  _unavailableGuildSchema
);

const _readySchema = v.object({
  /** [API version](https://discord.com/developers/docs/reference#api-versioning-api-versions) */
  v: v.number(),
  /** Information about the user including email */
  user: userSchema,
  /** Guilds the user is in */
  guilds: v.array(unavailableGuildSchema),
  /** Used for resuming connections */
  sessionId: v.string(),
  /** Gateway URL for resuming connections */
  resumeGatewayUrl: v.string(),
  /** [Shard information](https://discord.com/developers/docs/events/gateway#sharding) associated with this session, if sent when identifying */
  shard: v.optional(v.tuple([v.number(), v.number()])),
  /** Contains `id` and `flags` */
  application: v.object({
    id: snowflake,
    flags: applicationFlag
  })
});

export interface Ready extends v.InferOutput<typeof _readySchema> {}

/**
 * ### [Ready](https://discord.com/developers/docs/events/gateway-events#ready)
 *
 * Dispatched when a client has completed the initial handshake with the gateway
 * (for new sessions). The ready event can be the largest and most complex event
 * the gateway will send, as it contains all the state required for a client to
 * begin interacting with the rest of the platform.
 *
 * `guilds` are the guilds of which your bot is a member. They start out as
 * unavailable when you connect to the gateway. As they become available, your
 * bot will be notified via {@link onGuildCreate | Guild Create} events.
 */
export const readySchema = schema<Ready>(_readySchema);
