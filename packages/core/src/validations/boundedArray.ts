import * as v from "valibot";

/** A non-empty array with a length within the given bounds
 *
 * The length message is given to the array and its length checks only, not set with `v.message` around the whole pipe: that would also become the message of every issue inside an element that has no message of its own, hiding what is actually wrong.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const boundedArray = <TItem>(
  items: v.GenericSchema<TItem>,
  req: number | { min?: number; max?: number } = {}
): v.GenericSchema<TItem[]> => {
  const message = (issue: v.BaseIssue<unknown>): string =>
    `Expected an array with a length ${typeof req === `number` ? req : `>= ${req.min ?? 1}${typeof req.max === `number` ? ` && <= ${req.max}` : ``}`}, received: ${issue.received}`;
  return (
    typeof req === `number`
      ? v.pipe(v.array(items, message), v.length(req, message))
      : typeof req.max === `number`
        ? v.pipe(
            v.array(items, message),
            v.minLength(req.min ?? 1, message),
            v.maxLength(req.max, message)
          )
        : v.pipe(v.array(items, message), v.minLength(req.min ?? 1, message))
  ) as v.GenericSchema<TItem[]>;
};
