export const isObject = (val: unknown): val is object => Boolean(val) && typeof val === `object` && !Array.isArray(val);
