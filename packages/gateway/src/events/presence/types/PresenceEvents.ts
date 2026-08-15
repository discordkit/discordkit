// https://discord.com/developers/docs/events/gateway-events#presence-update

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { activitySchema } from "@discordkit/client/guild/types/Activity";
import { memberSchema } from "@discordkit/client/guild/types/Member";
import { userSchema } from "@discordkit/client/user/types/User";

/**
 * ### [Client Status](https://discord.com/developers/docs/events/gateway-events#client-status-object)
 *
 * Which platforms a user is active on. Every field is optional: an absent key
 * means "not active there", so a user online only on mobile has just `mobile`.
 */
const _clientStatusSchema = v.object({
  /** User's status set for an active desktop session */
  desktop: v.optional(v.string()),
  /** User's status set for an active mobile session */
  mobile: v.optional(v.string()),
  /** User's status set for an active web session */
  web: v.optional(v.string())
});

export interface ClientStatus extends v.InferOutput<
  typeof _clientStatusSchema
> {}

export const clientStatusSchema = schema<ClientStatus>(_clientStatusSchema);

const _presenceUpdateSchema = v.object({
  /** User whose presence is being updated */
  user: userSchema,
  /** ID of the guild */
  guildId: snowflake,
  /** Either "idle", "dnd", "online", or "offline" */
  status: v.string(),
  /** User's current activities */
  activities: v.array(activitySchema),
  /** User's platform-dependent status */
  clientStatus: clientStatusSchema
});

export interface PresenceUpdate extends v.InferOutput<
  typeof _presenceUpdateSchema
> {}

/**
 * ### [Presence Update](https://discord.com/developers/docs/events/gateway-events#presence-update)
 *
 * > [!WARNING]
 * >
 * > Requires the **privileged** `GUILD_PRESENCES` intent. Without it the event
 * > never arrives at all — silently, as with every intent.
 */
export const presenceUpdateSchema = schema<PresenceUpdate>(
  _presenceUpdateSchema
);

const _typingStartSchema = v.object({
  /** ID of the channel */
  channelId: snowflake,
  /** ID of the guild */
  guildId: v.optional(snowflake),
  /** ID of the user */
  userId: snowflake,
  /** Unix time (in seconds) of when the user started typing */
  timestamp: v.number(),
  /** The member who started typing if this happened in a guild */
  member: v.optional(memberSchema)
});

export interface TypingStart extends v.InferOutput<typeof _typingStartSchema> {}

/**
 * ### [Typing Start](https://discord.com/developers/docs/events/gateway-events#typing-start)
 *
 * Note `timestamp` is Unix **seconds**, not milliseconds — passing it straight
 * to `new Date()` yields a date in 1970.
 */
export const typingStartSchema = schema<TypingStart>(_typingStartSchema);
