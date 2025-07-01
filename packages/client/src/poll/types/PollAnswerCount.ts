import {
  integer,
  object,
  pipe,
  number,
  minValue,
  type InferOutput,
  boolean
} from "valibot";

export const pollAnswerCountSchema = object({
  /** The answerId */
  id: pipe(number(), integer(), minValue(0)),
  /** The number of votes for this answer */
  count: pipe(number(), integer(), minValue(0)),
  /** Whether the current user voted for this answer */
  meVoted: boolean()
});

export interface PollAnswerCount
  extends InferOutput<typeof pollAnswerCountSchema> {}
