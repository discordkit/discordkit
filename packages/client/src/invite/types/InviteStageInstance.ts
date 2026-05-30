import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

/**
 * ### [Invite Stage Instance](https://discord.com/developers/docs/resources/invite#invite-stage-instance-object)
 */
export const inviteStageInstanceSchema = v.object({
  /** the members speaking in the Stage */
  members: v.array(v.partial(memberSchema)),
  /** the number of users in the Stage */
  participantCount: boundedInteger(),
  /** the number of users speaking in the Stage */
  speakerCount: boundedInteger(),
  /** the topic of the {@link Stage | Stage instance} (1-120 characters) */
  topic: boundedString({ max: 120 })
});

export interface InviteStageInstance extends v.InferOutput<
  typeof inviteStageInstanceSchema
> {}
