import * as v from "valibot";
import { timestamp, boundedInteger } from "@discordkit/core";
import { applicationSchema } from "../../application/types/Application.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { inviteStageInstanceSchema } from "./InviteStageInstance.js";
import { inviteTargetSchema } from "./InviteTarget.js";
import { inviteTypeSchema } from "./InviteType.js";

export const inviteSchema = v.object({
  /** the type of invite */
  type: inviteTypeSchema,
  /** the invite code (unique ID) */
  code: v.string(),
  /** the guild this invite is for */
  guild: v.exactOptional(v.partial(guildSchema)),
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
    v.lazy(() => v.partial(applicationSchema))
  ),
  /** approximate count of online members, returned from the `GET /invites/<code>` endpoint when `with_counts` is true */
  approximatePresenceCount: v.exactOptional(boundedInteger()),
  /** approximate count of total members, returned from the `GET /invites/<code>` endpoint when `with_counts` is true */
  approximateMemberCount: v.exactOptional(boundedInteger()),
  /** the expiration date of this invite, returned from the `GET /invites/<code>` endpoint when `with_expiration` is true */
  expiresAt: v.nullish(timestamp),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: v.exactOptional(inviteStageInstanceSchema),
  /** guild scheduled event data, only included if `guild_scheduled_event_id` contains a valid guild scheduled event id */
  guildScheduledEvent: v.exactOptional(scheduledEventSchema)
});

export interface Invite extends v.InferOutput<typeof inviteSchema> {}
