import * as v from "valibot";
import { memberSchema } from "../../guild/types/Member.js";

export const inviteStageInstanceSchema = v.object({
  /** the members speaking in the Stage */
  members: v.array(v.partial(memberSchema)),
  /** the number of users in the Stage */
  participantCount: v.pipe(v.number(), v.integer(), v.minValue(0)),
  /** the number of users speaking in the Stage */
  speakerCount: v.pipe(v.number(), v.integer(), v.minValue(0)),
  /** the topic of the Stage instance (1-120 characters) */
  topic: v.pipe(v.string(), v.minLength(1), v.maxLength(120))
});

export interface InviteStageInstance
  extends v.InferOutput<typeof inviteStageInstanceSchema> {}
