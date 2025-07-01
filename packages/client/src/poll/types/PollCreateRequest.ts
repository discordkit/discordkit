import * as v from "valibot";
import { pollAnswerSchema } from "./PollAnswer.js";
import { pollMediaSchema } from "./PollMedia.js";
import { pollLayoutTypeSchema } from "./PollLayoutType.js";

/**
 * This is the request object used when creating a poll across the different endpoints. It is similar but not exactly identical to the main poll object. The main difference is that the request has `duration` which eventually becomes `expiry`.
 */
export const pollCreateRequestSchema = v.object({
  /** The question of the poll. Only `text` is supported. */
  question: pollMediaSchema,
  /** Each of the answers available in the poll, up to 10 */
  answers: v.pipe(v.array(pollAnswerSchema), v.maxLength(10)),
  /** Number of hours the poll should be open for, up to 32 days. Defaults to 24 */
  duration: v.exactOptional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(24 * 32))
  ),
  /** Whether a user can select multiple answers. Defaults to `false` */
  allowMultiselect: v.exactOptional(v.boolean()),
  /** The layout type of the poll. Defaults to... `DEFAULT`! */
  layoutType: pollLayoutTypeSchema
});

export interface PollCreateRequest
  extends v.InferOutput<typeof pollCreateRequestSchema> {}
