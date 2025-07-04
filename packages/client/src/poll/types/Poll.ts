import * as v from "valibot";
import { timestamp } from "@discordkit/core";
import { pollMediaSchema } from "./PollMedia.js";
import { pollAnswerSchema } from "./PollAnswer.js";
import { pollLayoutTypeSchema } from "./PollLayoutType.js";
import { pollResultsSchema } from "./PollResults.js";

/**
 * The poll object has a lot of levels and nested structures. It was also designed to support future extensibility, so some fields may appear to be more complex than necessary.
 *
 * `expiry` is marked as nullable to support non-expiring polls in the future, but all polls have an expiry currently.
 */
export const pollSchema = v.object({
  /** The question of the poll. Only `text` is supported. */
  question: pollMediaSchema,
  /** Each of the answers available in the poll. */
  answers: v.pipe(v.array(pollAnswerSchema), v.maxLength(10)),
  /** The time when the poll ends. */
  expiry: v.nullable(timestamp),
  /** Whether a user can select multiple answers */
  allowMultiselect: v.boolean(),
  /** The layout type of the poll */
  layoutType: pollLayoutTypeSchema,
  /** The results of the poll */
  results: v.exactOptional(pollResultsSchema)
});

export interface Poll extends v.InferOutput<typeof pollSchema> {}
