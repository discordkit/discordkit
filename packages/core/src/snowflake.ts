import { custom, pipe, transform, union, string, number, is } from "valibot";
import { isNonNullable } from "./isNonNullable.js";

export const snowflake = custom<string>(
  (val) =>
    isNonNullable(val) &&
    (typeof val === `bigint` ||
      typeof val === `number` ||
      typeof val === `string`)
      ? is(
          pipe(
            union([string(), number()]),
            transform((input) => new Date(input))
          ),
          Number((BigInt(val) >> 22n) + 1420070400000n)
        )
      : false,
  `Invalid Snowflake ID`
);
