import * as v from "valibot";

/**
 * A non-empty string with a length within the given bounds.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const boundedString = (
  req: number | { min?: number; max?: number } = {}
): v.GenericSchema<string> =>
  v.message<v.GenericSchema<string>>(
    typeof req === `number`
      ? v.pipe(v.string(), v.length(req))
      : typeof req.max === `number`
        ? v.pipe(v.string(), v.minLength(req.min ?? 1), v.maxLength(req.max))
        : v.pipe(v.string(), v.minLength(req.min ?? 1)),
    (issue) =>
      `Expected a string with a length ${typeof req === `number` ? req : `>= ${req.min ?? 1}${typeof req.max === `number` ? ` && <= ${req.max}` : ``}`}, received: ${issue.received}`
  );
