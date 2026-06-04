import { isNonNullable } from "../utils/isNonNullable.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";

export type RequestParams = Partial<
  Record<
    string,
    number[] | string[] | boolean | number | string | null | undefined
  >
>;

/**
 * Append a params object to a URL.
 *
 * Array values are emitted as repeated query keys (`?id=1&id=2`), which is
 * how Discord's HTTP API documents array query strings. Scalars are
 * stringified once. Keys are converted from camelCase to snake_case to
 * match Discord's convention.
 *
 * @__NO_SIDE_EFFECTS__
 */
export const addParams = (url: URL, params: RequestParams): URL => {
  for (const [key, value] of Object.entries(params)) {
    if (!isNonNullable(value)) continue;
    const snake = toSnakeCase(key);
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(snake, String(item));
    } else {
      url.searchParams.set(snake, String(value));
    }
  }

  return url;
};
