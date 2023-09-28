import { isNonNullable } from "./isNonNullable.ts";
import { toSnakeCase } from "./toSnakeCase.ts";

export type RequestParams = Partial<
  Record<
    string,
    number[] | string[] | boolean | number | string | null | undefined
  >
>;

export const addParams = <P extends RequestParams>(
  url: URL,
  params: P
): URL => {
  for (const [key, value] of Object.entries(params)) {
    if (isNonNullable(value)) {
      url.searchParams.set(toSnakeCase(key), value.toString());
    }
  }

  return url;
};
