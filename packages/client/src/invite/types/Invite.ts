import {
  object,
  string,
  partial,
  nullish,
  number,
  lazy,
  type InferOutput,
  exactOptional,
  nullable,
  pipe,
  integer,
  isoTimestamp
} from "valibot";
import { applicationSchema } from "../../application/types/Application.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { scheduledEventSchema } from "../../event/types/ScheduledEvent.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";
import { inviteStageInstanceSchema } from "./InviteStageInstance.js";
import { inviteTargetSchema } from "./InviteTarget.js";
import { inviteTypeSchema } from "./InviteType.js";

export const inviteSchema = object({
  /** the type of invite */
  type: inviteTypeSchema,
  /** the invite code (unique ID) */
  code: string(),
  /** the guild this invite is for */
  guild: exactOptional(partial(guildSchema)),
  /** the channel this invite is for */
  channel: nullable(channelSchema),
  /** the user who created the invite */
  inviter: exactOptional(userSchema),
  /** the type of target for this voice channel invite */
  targetType: exactOptional(inviteTargetSchema),
  /** the user whose stream to display for this voice channel stream invite */
  targetUser: exactOptional(userSchema),
  /** the embedded application to open for this voice channel embedded application invite */
  targetApplication: exactOptional(lazy(() => partial(applicationSchema))),
  /** approximate count of online members, returned from the `GET /invites/<code>` endpoint when `with_counts` is true */
  approximatePresenceCount: exactOptional(pipe(number(), integer())),
  /** approximate count of total members, returned from the `GET /invites/<code>` endpoint when `with_counts` is true */
  approximateMemberCount: exactOptional(pipe(number(), integer())),
  /** the expiration date of this invite, returned from the `GET /invites/<code>` endpoint when `with_expiration` is true */
  expiresAt: nullish(pipe(string(), isoTimestamp())),
  /** stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated) */
  stageInstance: exactOptional(inviteStageInstanceSchema),
  /** guild scheduled event data, only included if `guild_scheduled_event_id` contains a valid guild scheduled event id */
  guildScheduledEvent: exactOptional(scheduledEventSchema)
});

export interface Invite extends InferOutput<typeof inviteSchema> {}
