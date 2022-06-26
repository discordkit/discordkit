import type { z } from "zod";
import type { RequestParams } from "./addParams";
import { buildURL } from "./buildURL";
import type { RequestBody } from "./request";
import { request } from "./request";
import type { Fetcher, MutationBuilder, QueryBuilder } from "./types";

const validate = (schema: z.Schema, body: z.ZodType | undefined, params: z.ZodType | undefined): void => {
  if (body) {
    schema.parse(body);
  } else if (params) {
    schema.parse(params);
  }
};

export const query = <T, S extends z.ZodTypeAny>(
  schema: S,
  fn: QueryBuilder<z.infer<S>, T>
): QueryBuilder<z.infer<S>, T> =>
  new Proxy(fn, {
    // eslint-disable-next-line @typescript-eslint/space-before-function-paren
    apply: function (target, thisArg, args): Fetcher<T> {
      validate(schema, args[1]?.body, args[1]?.params);
      return target.apply(thisArg, args) as Fetcher<T>;
    }
  });

export const mutation = <T, S extends z.ZodTypeAny>(
  schema: S,
  fn: MutationBuilder<z.infer<S>, T>
): MutationBuilder<z.infer<S>, T> =>
  new Proxy(fn, {
    // eslint-disable-next-line @typescript-eslint/space-before-function-paren
    apply: async function (target, thisArg, args): Promise<T> {
      validate(schema, args[1]?.body, args[1]?.params);
      return target.apply(thisArg, args) as Promise<T>;
    }
  });

export const get =
  <T>(url: string, params?: RequestParams): Fetcher<T> =>
  async () =>
    request(buildURL(url, params));

export const post = async <T>(url: string, body?: RequestBody): Promise<T> => request(buildURL(url), `POST`, body);

export const put = async <T>(url: string, body?: RequestBody): Promise<T> => request(buildURL(url), `PUT`, body);

export const patch = async <T>(url: string, body?: RequestBody): Promise<T> => request(buildURL(url), `PATCH`, body);

export const remove = async <T = void>(url: string): Promise<T> => request(buildURL(url), `DELETE`);
