import { isObject } from "./isObject.js";
import { toCamelCase } from "./toCamelCase.js";

/**
 * Convert a `snake_case` string-literal type to `camelCase`, matching exactly
 * what {@link toCamelCase} does at runtime: each `_x` becomes `X`. Self-contained
 * (no general word-splitting); we only ever convert underscore-delimited Discord
 * API keys, so this is all the casing we need.
 */
type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${CamelCase<Capitalize<Tail>>}`
  : S;

/**
 * Recursively camel-case the keys of an object/array type. Mirrors
 * {@link toCamelKeys}'s runtime: arrays map element-wise, plain objects remap
 * their keys, and leaf values pass through unchanged. Replaces type-fest's
 * `CamelCasedPropertiesDeep` — narrower (no Set/tuple/options handling) because
 * the only inputs are plain nested Discord API JSON.
 */
export type CamelKeys<T> =
  T extends ReadonlyArray<infer U>
    ? Array<CamelKeys<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string ? CamelCase<K> : K]: CamelKeys<
            T[K]
          >;
        }
      : T;

export const toCamelKeys = <T extends object>(o: T): CamelKeys<T> => {
  if (Array.isArray(o)) {
    return o.map(toCamelKeys) as CamelKeys<T>;
  } else if (isObject(o)) {
    return Object.entries(o).reduce((acc, [key, value]) => {
      // @ts-expect-error
      acc[toCamelCase(key)] = toCamelKeys(value);
      return acc;
    }, {}) as CamelKeys<T>;
  }

  return o as CamelKeys<T>;
};
