import { special, coerce, date, is } from "valibot";
import { isNonNullable } from "./isNonNullable.js";

export const snowflake = special<string>(
  (val) =>
    isNonNullable(val) &&
    (typeof val === `bigint` ||
      typeof val === `number` ||
      typeof val === `string`)
      ? is(
          coerce(date(), (input: number) => new Date(input)),
          // eslint-disable-next-line no-bitwise
          Number((BigInt(val) >> 22n) + 1420070400000n)
        )
      : false,
  `Invalid Snowflake ID`
);
