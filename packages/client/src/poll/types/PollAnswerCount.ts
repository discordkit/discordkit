import * as v from "valibot";

export const pollAnswerCountSchema = v.object({
  /** The answerId */
  id: v.pipe(v.number(), v.integer(), v.minValue(0)),
  /** The number of votes for this answer */
  count: v.pipe(v.number(), v.integer(), v.minValue(0)),
  /** Whether the current user voted for this answer */
  meVoted: v.boolean()
});

export interface PollAnswerCount
  extends v.InferOutput<typeof pollAnswerCountSchema> {}
