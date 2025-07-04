import type { SnakeCasedPropertiesDeep } from "type-fest";
import { isObject } from "./isObject.js";
import { toSnakeCase } from "./toSnakeCase.js";

export const toSnakeKeys = <T extends object>(
  o: T
): SnakeCasedPropertiesDeep<T> => {
  if (Array.isArray(o)) {
    return o.map(toSnakeKeys) as SnakeCasedPropertiesDeep<T>;
  } else if (isObject(o)) {
    return Object.entries(o).reduce((acc, [key, value]) => {
      // @ts-expect-error
      acc[toSnakeCase(key)] = toSnakeKeys(value);
      return acc;
    }, {}) as SnakeCasedPropertiesDeep<T>;
  }

  return o;
};
