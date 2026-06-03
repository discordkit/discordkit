import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { partialSchema, schema } from "@discordkit/core/validations/schema";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { applicationSchema } from "../../application/types/Application.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { inviteStageInstanceSchema } from "./InviteStageInstance.js";
import { inviteTargetSchema } from "./InviteTarget.js";
import { inviteTypeSchema } from "./InviteType.js";

export const inviteEntries = {
  /** the type of invite */
  type: inviteTypeSchema,
  /** the invite code (unique ID) */
  code: v.string(),
  /** the guild this invite is for */
  guild: v.exactOptional(partialSchema(guildSchema)),
  /** the channel this invite is for */
  channel: v.nullable(channelSchema),
  /** the user who created the invite */
  inviter: v.exactOptional(userSchema),
  /** the type of target for this voice channel invite */
  targetType: v.exactOptional(inviteTargetSchema),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: v.exactOptional(userSchema),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: v.exactOptional(
    v.lazy(() => partialSchema(applicationSchema))
  ),
  /** approximate count of online members, returned from the `GET /invites/<code>` endpoint when `withCounts` is `true` */
  approximatePresenceCount: v.exactOptional(boundedInteger()),
  /** approximate count of total members, returned from the `GET /invites/<code>` endpoint when `withCounts` is `true` */
  approximateMemberCount: v.exactOptional(boundedInteger()),
  /** the expiration date of this invite, returned from the `GET /invites/<code>` endpoint when `withExpiration` is `true` */
  expiresAt: v.nullish(timestamp),
  /** {@link Stage | stage instance} data if there is a public {@link Stage | Stage instance} in the Stage channel this invite is for (deprecated) */
  stageInstance: v.exactOptional(inviteStageInstanceSchema),
  /** {@link ScheduledEvent | guild scheduled event} data, only included if `guildScheduledEventId` contains a valid {@link ScheduledEvent | guild scheduled event} id */
  guildScheduledEvent: v.exactOptional(scheduledEventSchema)
} as const;

const _inviteSchema = v.object(inviteEntries);

export interface Invite extends v.InferOutput<typeof _inviteSchema> {}

/**
 * ### [Invite](https://discord.com/developers/docs/resources/invite#invite-object)
 *
 * Represents a code that when used, adds a user to a guild or group {@link Channel | DM channel}.
 */
export const inviteSchema = schema<Invite>(_inviteSchema);
