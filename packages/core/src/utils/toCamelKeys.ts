import type { CamelCasedPropertiesDeep } from "type-fest";
import { isObject } from "./isObject.js";
import { toCamelCase } from "./toCamelCase.js";

export const toCamelKeys = <T extends object>(
  o: T
): CamelCasedPropertiesDeep<T> => {
  if (Array.isArray(o)) {
    return o.map(toCamelKeys) as CamelCasedPropertiesDeep<T>;
  } else if (isObject(o)) {
    return Object.entries(o).reduce((acc, [key, value]) => {
      // @ts-expect-error
      acc[toCamelCase(key)] = toCamelKeys(value);
      return acc;
    }, {}) as CamelCasedPropertiesDeep<T>;
  }

  return o;
};
