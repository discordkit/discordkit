import {
  exactOptional,
  nonEmpty,
  object,
  partial,
  pipe,
  string,
  type InferOutput
} from "valibot";
import { emojiSchema } from "../../emoji/types/Emoji.js";

/**
 * The poll media object is a common object that backs both the question and answers. The intention is that it allows us to extensibly add new ways to display things in the future. For now, `question` only supports `text`, while answers can have an optional `emoji`.
 *
 * `text` should always be non-null for both questions and answers, but please do not depend on that in the future. The maximum length of `text` is 300 for the question, and 55 for any answer.
 *
 * When creating a poll answer with an emoji, one only needs to send either the `id` (custom emoji) or `name` (default emoji) as the only field.
 */
export const pollMediaSchema = object({
  /** The question of the poll. Only `text` is supported. */
  text: exactOptional(pipe(string(), nonEmpty())),
  /** Each of the answers available in the poll. */
  answers: exactOptional(partial(emojiSchema))
});

export interface PollMedia extends InferOutput<typeof pollMediaSchema> {}
