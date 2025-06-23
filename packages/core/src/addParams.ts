import { isNonNullable } from "./isNonNullable.js";
import { toSnakeCase } from "./toSnakeCase.js";

export type RequestParams = Partial<
  Record<
    string,
    number[] | string[] | boolean | number | string | null | undefined
  >
>;

export const addParams = (url: URL, params: RequestParams): URL => {
  for (const [key, value] of Object.entries(params)) {
    if (isNonNullable(value)) {
      url.searchParams.set(toSnakeCase(key), value.toString());
    }
  }

  return url;
};
