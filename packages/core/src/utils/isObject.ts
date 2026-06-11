export const isObject = (val: unknown): val is Record<string, unknown> =>
  Boolean(val) && typeof val === `object` && !Array.isArray(val);
