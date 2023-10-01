import { z } from "zod";
import { isNonNullable } from "./isNonNullable.ts";

export const snowflake = z
  .custom<string>((val) => {
    if (
      isNonNullable(val) &&
      (typeof val === `bigint` ||
        typeof val === `number` ||
        typeof val === `string`)
    ) {
      return (
        z.coerce
          .date()
          // eslint-disable-next-line no-bitwise
          .safeParse(Number((BigInt(val) >> 22n) + 1420070400000n))
      );
    }
    return false;
  }, `Invalid Snowflake ID`)
  .describe(`Discord Snowflake ID`);
