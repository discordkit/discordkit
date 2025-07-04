import * as v from "valibot";

/** An integer with a value within the given bounds */
export const boundedInteger = (
  req: number | { min?: number; max?: number } = {}
): v.GenericSchema<number> =>
  v.message<v.GenericSchema<number>>(
    typeof req === `number`
      ? v.pipe(v.number(), v.integer(), v.value(req))
      : typeof req.max === `number`
        ? v.pipe(
            v.number(),
            v.integer(),
            v.minValue(req.min ?? 0),
            v.maxValue(req.max)
          )
        : v.pipe(v.number(), v.integer(), v.minValue(req.min ?? 0)),
    (issue) =>
      `Expected an integer with a value ${typeof req === `number` ? `of ${req}` : `>= ${req.min ?? 0}${req.max ? `&& <= ${req.max}` : ``}`}, received has value: ${issue.received.length}`
  );
