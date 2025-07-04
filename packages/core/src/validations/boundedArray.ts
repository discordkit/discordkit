import * as v from "valibot";

/** A non-empty array with a length within the given bounds */
export const boundedArray = <TItem>(
  items: v.GenericSchema<TItem>,
  req: number | { min?: number; max?: number } = {}
): v.GenericSchema<TItem[]> =>
  v.message<v.GenericSchema<TItem[]>>(
    typeof req === `number`
      ? v.pipe(v.array(items), v.length(req))
      : typeof req.max === `number`
        ? v.pipe(
            v.array(items),
            v.minLength(req.min ?? 1),
            v.maxLength(req.max)
          )
        : v.pipe(v.array(items), v.minLength(req.min ?? 1)),
    (issue) =>
      `Expected an array with a legnth ${typeof req === `number` ? req : `>= ${req.min ?? 0}${req.max ? `&& <= ${req.max}` : ``}`}, received has length: ${issue.received.length}`
  );
