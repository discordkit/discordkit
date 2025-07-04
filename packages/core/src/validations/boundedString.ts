import * as v from "valibot";

/** A non-empty string with a length within the given bounds */
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
      `Expected a string with a legnth ${typeof req === `number` ? req : `>= ${req.min ?? 0}${req.max ? `&& <= ${req.max}` : ``}`}, received has length: ${issue.received.length}`
  );
