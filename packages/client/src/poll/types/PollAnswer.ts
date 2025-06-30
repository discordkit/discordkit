import {
  integer,
  object,
  pipe,
  number,
  minValue,
  type InferOutput
} from "valibot";
import { pollMediaSchema } from "./PollMedia.js";

/**
 * The `answerId` is a number that labels each answer. As an implementation detail, it currently starts at 1 for the first answer and goes up sequentially. We recommend against depending on this sequence.

Currently, there is a maximum of 10 answers per poll.
 */
export const pollAnswerSchema = object({
  /** The ID of the answer (Only sent as part of responses from Discord's API/Gateway.) */
  answerId: pipe(number(), integer(), minValue(0)),
  /** The data of the answer. */
  pollMedia: pollMediaSchema
});

export type PollAnswer = InferOutput<typeof pollAnswerSchema>;
