// https://discord.com/developers/docs/events/gateway-events#invite-create

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { userSchema } from "@discordkit/client/user/types/User";

const _inviteCreateSchema = v.object({
  /** Channel the invite is for */
  channelId: snowflake,
  /** Unique invite code */
  code: v.string(),
  /** Time at which the invite was created */
  createdAt: timestamp,
  /** Guild of the invite */
  guildId: v.optional(snowflake),
  /** User that created the invite */
  inviter: v.optional(userSchema),
  /** How long the invite is valid for, in seconds */
  maxAge: v.number(),
  /** Maximum number of times the invite can be used */
  maxUses: v.number(),
  /** Type of target for this voice channel invite */
  targetType: v.optional(v.number()),
  /** User whose stream to display for this voice channel stream invite */
  targetUser: v.optional(userSchema),
  /** Embedded application to open for this voice channel embedded application invite */
  targetApplication: v.optional(v.unknown()),
  /** Whether the invite is temporary */
  temporary: v.boolean(),
  /** How many times the invite has been used (always will be 0) */
  uses: v.number(),
  /** Expiry time of the invite */
  expiresAt: v.nullable(timestamp),
  /** Ids of the roles assigned to the invited user */
  roleIds: v.optional(v.array(snowflake))
});

export interface InviteCreate extends v.InferOutput<
  typeof _inviteCreateSchema
> {}

/**
 * ### [Invite Create](https://discord.com/developers/docs/events/gateway-events#invite-create)
 *
 * `uses` is always `0` here — the invite was just created, so nobody has used
 * it yet. Treating it as a live counter would be a mistake.
 */
export const inviteCreateSchema = schema<InviteCreate>(_inviteCreateSchema);

const _inviteDeleteSchema = v.object({
  /** Channel of the invite */
  channelId: snowflake,
  /** Guild of the invite */
  guildId: v.optional(snowflake),
  /** Unique invite code */
  code: v.string()
});

export interface InviteDelete extends v.InferOutput<
  typeof _inviteDeleteSchema
> {}

/**
 * ### [Invite Delete](https://discord.com/developers/docs/events/gateway-events#invite-delete)
 */
export const inviteDeleteSchema = schema<InviteDelete>(_inviteDeleteSchema);
