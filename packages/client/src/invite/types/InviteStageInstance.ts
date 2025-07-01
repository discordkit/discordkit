import {
  object,
  partial,
  array,
  number,
  integer,
  minValue,
  string,
  minLength,
  maxLength,
  type InferOutput,
  pipe
} from "valibot";
import { memberSchema } from "../../guild/types/Member.js";

export const inviteStageInstanceSchema = object({
  /** the members speaking in the Stage */
  members: array(partial(memberSchema)),
  /** the number of users in the Stage */
  participantCount: pipe(number(), integer(), minValue(0)),
  /** the number of users speaking in the Stage */
  speakerCount: pipe(number(), integer(), minValue(0)),
  /** the topic of the Stage instance (1-120 characters) */
  topic: pipe(string(), minLength(1), maxLength(120))
});

export interface InviteStageInstance
  extends InferOutput<typeof inviteStageInstanceSchema> {}
