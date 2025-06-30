import {
  custom,
  pipe,
  transform,
  union,
  string,
  number,
  is,
  title
} from "valibot";
import { isNonNullable } from "../utils/isNonNullable.js";

export const DISCORD_EPOCH = 1420070400000n;

export const snowflake = pipe(
  custom<string>(
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
            Number((BigInt(val) >> 22n) + DISCORD_EPOCH)
          )
        : false,
    `Invalid Snowflake ID`
  ),
  title(`snowflake`)
);

/**
 * Converts a `snowflake` string to a Date relative to the given epoch
 *
 * Uses Discord's epoch by default
 *
 * https://discord.com/developers/docs/reference#snowflakes
 */
export const snowflakeToDate = (
  /** A snowflake string to convert */
  val: string,
  /** time in milliseconds to use as the epoch to derive a Date from */
  epoch = DISCORD_EPOCH
): Date => new Date(Number((BigInt(val) >> 22n) + epoch));

/**
 * Converts a Date to a `snowflake` string relative to the given epoch
 *
 * Uses Discord's epoch by default
 *
 * https://discord.com/developers/docs/reference#snowflakes
 */
export const dateToSnowflake = (
  /** A Date to convert to a `snowflake` */
  val: Date,
  /** time in milliseconds to use as the epoch to derive a `snowflake` from */
  epoch = DISCORD_EPOCH
): string => String((BigInt(val.getMilliseconds()) - epoch) << 22n);
