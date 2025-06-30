import type { InferOutput } from "valibot";
import {
  array,
  boolean,
  exactOptional,
  integer,
  maxLength,
  maxValue,
  minValue,
  number,
  object,
  pipe
} from "valibot";
import { pollAnswerSchema } from "./PollAnswer.js";
import { pollMediaSchema } from "./PollMedia.js";
import { pollLayoutTypeSchema } from "./PollLayoutType.js";

/**
 * This is the request object used when creating a poll across the different endpoints. It is similar but not exactly identical to the main poll object. The main difference is that the request has `duration` which eventually becomes `expiry`.
 */
export const pollCreateRequestSchema = object({
  /** The question of the poll. Only `text` is supported. */
  question: pollMediaSchema,
  /** Each of the answers available in the poll, up to 10 */
  answers: pipe(array(pollAnswerSchema), maxLength(10)),
  /** Number of hours the poll should be open for, up to 32 days. Defaults to 24 */
  duration: exactOptional(
    pipe(number(), integer(), minValue(1), maxValue(24 * 32))
  ),
  /** Whether a user can select multiple answers. Defaults to `false` */
  allowMultiselect: exactOptional(boolean()),
  /** The layout type of the poll. Defaults to... `DEFAULT`! */
  layoutType: pollLayoutTypeSchema
});

export type PollCreateRequest = InferOutput<typeof pollCreateRequestSchema>;
