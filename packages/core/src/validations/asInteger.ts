import * as v from "valibot";
import type { bitfield } from "./bitfield.js";

/**
 * Transforms a `bitfield` schema into an integer
 */
export const asInteger = (
  schema: ReturnType<typeof bitfield>
): v.GenericSchema<number> =>
  v.pipe(
    schema,
    v.transform((val) => parseInt(val.toString(), 10)),
    v.integer()
  ) as v.GenericSchema<number>;
