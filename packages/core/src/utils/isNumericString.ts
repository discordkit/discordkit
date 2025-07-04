export const isNumericString = (val: unknown): val is string =>
  typeof val === `string` && /^\d+$/.test(val);
