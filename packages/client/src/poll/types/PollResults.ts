import { object, type InferOutput, boolean, array } from "valibot";
import { pollAnswerCountSchema } from "./PollAnswerCount.js";

/**
 * In a nutshell, this contains the number of votes for each answer.
 *
 * The `results` field may be not present in certain responses where, as an implementation detail, we do not fetch the poll results in our backend. This should be treated as "unknown results", as opposed to "no results". You can keep using the results if you have previously received them through other means.
 *
 * Also due to the intricacies of counting at scale, while a poll is in progress the results may not be perfectly accurate. They usually are accurate, and shouldn't deviate significantly -- it's just difficult to make guarantees.
 *
 * To compensate for this, after a poll is finished there is a background job which performs a final, accurate tally of votes. This tally concludes once `isFinalized` is `true`. Polls that have ended will also always contain results.
 *
 * If `answerCounts` does not contain an entry for a particular answer, then there are no votes for that answer.
 */
export const pollResultsSchema = object({
  /** Whether the votes have been precisely counted */
  isFinalized: boolean(),
  /** The counts for each answer */
  answerCounts: array(pollAnswerCountSchema)
});

export type PollResults = InferOutput<typeof pollResultsSchema>;
