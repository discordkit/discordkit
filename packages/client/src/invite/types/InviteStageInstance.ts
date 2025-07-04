import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

export const inviteStageInstanceSchema = v.object({
  /** the members speaking in the Stage */
  members: v.array(v.partial(memberSchema)),
  /** the number of users in the Stage */
  participantCount: boundedInteger(),
  /** the number of users speaking in the Stage */
  speakerCount: boundedInteger(),
  /** the topic of the Stage instance (1-120 characters) */
  topic: boundedString({ max: 120 })
});

export interface InviteStageInstance
  extends v.InferOutput<typeof inviteStageInstanceSchema> {}
