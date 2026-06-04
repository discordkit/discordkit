import * as v from "valibot";
import type { bitfield } from "./bitfield.js";

/**
 * Transforms a `bitfield` schema into a numeric string
 *
 * @__NO_SIDE_EFFECTS__
 */
export const asDigits = (
  schema: ReturnType<typeof bitfield>
): v.GenericSchema<string> =>
  v.pipe(
    schema,
    v.transform((val) => val.toString()),
    v.digits()
  ) as v.GenericSchema<string>;
