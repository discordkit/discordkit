import * as v from "valibot";
import { isNonNullable } from "../utils/isNonNullable.js";
import { isNumericString } from "../utils/isNumericString.js";

/** UNIX timestamp representing the first second of 2015 */
export const DISCORD_EPOCH = 1420070400000n;

/**
 * Converts a `snowflake` string to a Date relative to the given epoch
 *
 * Uses Discord's epoch by default
 *
 * https://discord.com/developers/docs/reference#snowflakes
 */
export const snowflakeToDate = (
  /** A snowflake string to convert */
  val: string | number | bigint,
  /** time in milliseconds to use as the epoch to derive a Date from */
  epoch = DISCORD_EPOCH
): Date => new Date(Number((BigInt(val) >> 22n) + epoch));

/**
 * An up to 64-bit unsigned numeric value derived from a timestamp which
 * serves as a unique identifier within Discord.
 *
 * Validates whether a given `number`, `bigint`, or numeric `string` is
 * a valid [Snowflake](https://discord.com/developers/docs/reference#snowflakes)
 * by checking if it's derived timestamp is a valid time at or after
 * the Discord epoch (the first second of 2015, ie: `1420070400000`).
 */
export const snowflake: v.GenericSchema<string> = v.pipe(
  v.custom<string, `Invalid Snowflake`>(
    (val) =>
      // at runtime this could be any value, so filter out
      // obviously invalid input first
      isNonNullable(val) &&
      // then verify we have a numeric value
      (typeof val === `bigint` ||
        typeof val === `number` ||
        isNumericString(val)) &&
      // finally, verify that it accurately represents ms
      // at or after the Discord epoch (timestamps before
      // that cannot possibly be a valid Discord snowflake)
      snowflakeToDate(val).getTime() >= DISCORD_EPOCH,
    `Invalid Snowflake`
  ),
  v.title(`snowflake`)
);
