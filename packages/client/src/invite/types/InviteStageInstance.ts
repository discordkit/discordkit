import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { partialSchema } from "@discordkit/core/validations/schema";
import { memberSchema } from "../../guild/types/Member.js";

/**
 * ### [Invite Stage Instance](https://discord.com/developers/docs/resources/invite#invite-stage-instance-object)
 */
export const inviteStageInstanceSchema = v.object({
  /** the members speaking in the Stage */
  members: v.array(partialSchema(memberSchema)),
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
