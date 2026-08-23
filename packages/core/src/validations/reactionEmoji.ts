import * as v from "valibot";
import { isNonNullable } from "../utils/isNonNullable.js";
import { DISCORD_EPOCH, snowflakeToDate } from "./snowflake.js";
import { isNumericString } from "../utils/isNumericString.js";

/** Whether a value is a valid custom emoji id */
const isSnowflake = (val: unknown): boolean =>
  isNonNullable(val) &&
  (typeof val === `bigint` ||
    typeof val === `number` ||
    isNumericString(val)) &&
  snowflakeToDate(val as string).getTime() >= DISCORD_EPOCH;

/**
 * An emoji identifying a reaction in a request path.
 *
 * Reaction endpoints accept three forms, only one of which is a
 * {@link snowflake}:
 *
 * - a Unicode emoji, as the character itself (`"❌"`)
 * - a custom emoji, as `name:id` (`"catgirl:1234567890123456789"`)
 * - a custom emoji's bare id
 *
 * Callers do not need to percent-encode the value. `URL` encodes non-ASCII
 * path segments on its own and leaves an existing `%` untouched, so encoded
 * and unencoded input produce identical requests.
 *
 * A `/` is rejected because it would split into a second path segment and
 * address a different endpoint.
 */
export const reactionEmoji: v.GenericSchema<string> = v.pipe(
  v.custom<string, `Invalid reaction emoji`>((val) => {
    if (typeof val === `bigint` || typeof val === `number`) {
      return isSnowflake(val);
    }
    if (typeof val !== `string` || val.length === 0 || val.includes(`/`)) {
      return false;
    }
    // custom emoji, as `name:id`
    if (val.includes(`:`)) {
      const [name, ...rest] = val.split(`:`);
      return (
        rest.length === 1 && name!.length > 0 && isSnowflake(rest[0] as string)
      );
    }
    // a bare custom emoji id, otherwise a Unicode emoji
    return true;
  }, `Invalid reaction emoji`),
  v.title(`reactionEmoji`)
);
